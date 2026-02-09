import { tmdbClientFetch } from "@/lib/tmdb/client-proxy";
import type { TMDBMovie, TMDBMovieListResponse } from "@/lib/tmdb/types";
import type { WatchedMovie } from "@/types";
import { RECOMMENDATION_BATCH_SIZE, MAX_RECOMMENDATIONS } from "@/lib/constants";

export interface ScoredMovie extends TMDBMovie {
  recommendationScore: number;
  frequency: number;
  sources: number[];
  fromFavorite: boolean;
  genreMatchScore: number;
}

export interface GenreProfile {
  /** genre_id -> normalized weight (0-1) */
  weights: Map<number, number>;
  /** Top genre IDs sorted by preference */
  topGenreIds: number[];
}

export interface RecommendationProgress {
  current: number;
  total: number;
  phase: "fetching" | "scoring" | "done";
}

const FAVORITE_WEIGHT = 2;

/**
 * Build a genre preference profile from watched movies.
 * Each genre occurrence is counted, with favorites weighted double.
 */
function buildGenreProfile(
  watchedMovies: WatchedMovie[],
  favoriteIds: Set<number>
): GenreProfile {
  const genreCounts = new Map<number, number>();

  for (const movie of watchedMovies) {
    const genres = movie.genre_ids ?? [];
    const weight = favoriteIds.has(movie.id) ? FAVORITE_WEIGHT : 1;

    for (const gid of genres) {
      genreCounts.set(gid, (genreCounts.get(gid) ?? 0) + weight);
    }
  }

  if (genreCounts.size === 0) {
    return { weights: new Map(), topGenreIds: [] };
  }

  const maxCount = Math.max(...genreCounts.values());
  const weights = new Map<number, number>();
  for (const [gid, count] of genreCounts) {
    weights.set(gid, count / maxCount);
  }

  const topGenreIds = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([gid]) => gid);

  return { weights, topGenreIds };
}

/**
 * Calculate how well a movie's genres match the user's preference profile.
 * Returns 0-1 score.
 */
function calcGenreMatchScore(
  movieGenreIds: number[],
  profile: GenreProfile
): number {
  if (movieGenreIds.length === 0 || profile.weights.size === 0) return 0;

  let totalWeight = 0;
  for (const gid of movieGenreIds) {
    totalWeight += profile.weights.get(gid) ?? 0;
  }

  return totalWeight / movieGenreIds.length;
}

export async function generateRecommendations(
  watchedMovies: WatchedMovie[],
  favoriteIds: Set<number>,
  onProgress?: (progress: RecommendationProgress) => void
): Promise<{ movies: ScoredMovie[]; genreProfile: GenreProfile }> {
  const emptyResult = { movies: [], genreProfile: { weights: new Map(), topGenreIds: [] } };
  if (watchedMovies.length === 0) return emptyResult;

  const watchedIds = watchedMovies.map((m) => m.id);
  const genreProfile = buildGenreProfile(watchedMovies, favoriteIds);

  // Process favorites first for better UX
  const sortedIds = [...watchedIds].sort((a, b) => {
    const aFav = favoriteIds.has(a) ? 0 : 1;
    const bFav = favoriteIds.has(b) ? 0 : 1;
    return aFav - bFav;
  });

  const candidateMap = new Map<
    number,
    {
      movie: TMDBMovie;
      frequency: number;
      sources: number[];
      favoriteSourceCount: number;
    }
  >();
  const watchedSet = new Set(watchedIds);
  const total = sortedIds.length;

  for (let i = 0; i < sortedIds.length; i += RECOMMENDATION_BATCH_SIZE) {
    const batch = sortedIds.slice(i, i + RECOMMENDATION_BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.flatMap((id) => [
        tmdbClientFetch<TMDBMovieListResponse>(
          `/movie/${id}/recommendations`
        ),
        tmdbClientFetch<TMDBMovieListResponse>(`/movie/${id}/similar`),
      ])
    );

    batch.forEach((watchedId, batchIndex) => {
      const recResult = results[batchIndex * 2];
      const simResult = results[batchIndex * 2 + 1];
      const isFromFavorite = favoriteIds.has(watchedId);

      const movies: TMDBMovie[] = [];
      if (recResult.status === "fulfilled") {
        movies.push(...recResult.value.results);
      }
      if (simResult.status === "fulfilled") {
        movies.push(...simResult.value.results);
      }

      for (const movie of movies) {
        if (watchedSet.has(movie.id)) continue;

        const existing = candidateMap.get(movie.id);
        if (existing) {
          existing.frequency += 1;
          if (isFromFavorite) existing.favoriteSourceCount += 1;
          if (!existing.sources.includes(watchedId)) {
            existing.sources.push(watchedId);
          }
        } else {
          candidateMap.set(movie.id, {
            movie,
            frequency: 1,
            sources: [watchedId],
            favoriteSourceCount: isFromFavorite ? 1 : 0,
          });
        }
      }
    });

    onProgress?.({
      current: Math.min(i + RECOMMENDATION_BATCH_SIZE, total),
      total,
      phase: "fetching",
    });
  }

  onProgress?.({ current: 0, total: candidateMap.size, phase: "scoring" });

  const candidates = Array.from(candidateMap.values());
  if (candidates.length === 0) return { movies: [], genreProfile };

  // Apply favorite weight: each "hit" from a favorite movie counts double
  const weightedCandidates = candidates.map((c) => ({
    ...c,
    weightedFrequency:
      c.frequency +
      c.favoriteSourceCount * (FAVORITE_WEIGHT - 1),
  }));

  const maxFrequency = Math.max(
    ...weightedCandidates.map((c) => c.weightedFrequency)
  );
  const maxPopularity = Math.max(
    ...candidates.map((c) => c.movie.popularity)
  );

  const hasGenreData = genreProfile.weights.size > 0;

  // Score formula: frequency 40% + genre 25% + rating 20% + popularity 15%
  // Falls back to old formula if no genre data available
  const scored: ScoredMovie[] = weightedCandidates.map((c) => {
    const frequencyScore = c.weightedFrequency / maxFrequency;
    const genreScore = calcGenreMatchScore(c.movie.genre_ids, genreProfile);
    const ratingScore = c.movie.vote_average / 10;
    const popularityScore =
      maxPopularity > 0 ? c.movie.popularity / maxPopularity : 0;

    const compositeScore = hasGenreData
      ? frequencyScore * 0.4 +
        genreScore * 0.25 +
        ratingScore * 0.2 +
        popularityScore * 0.15
      : frequencyScore * 0.5 + ratingScore * 0.3 + popularityScore * 0.2;

    return {
      ...c.movie,
      recommendationScore: Math.round(compositeScore * 100) / 100,
      frequency: c.frequency,
      sources: c.sources,
      fromFavorite: c.favoriteSourceCount > 0,
      genreMatchScore: Math.round(genreScore * 100) / 100,
    };
  });

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

  onProgress?.({
    current: candidateMap.size,
    total: candidateMap.size,
    phase: "done",
  });

  return { movies: scored.slice(0, MAX_RECOMMENDATIONS), genreProfile };
}
