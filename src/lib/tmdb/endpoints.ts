import { tmdbFetch } from "./client";
import type {
  TMDBMovieListResponse,
  TMDBMovieDetail,
  TMDBPersonListResponse,
  TMDBPersonDetail,
} from "./types";

export async function searchMovies(query: string, page = 1) {
  return tmdbFetch<TMDBMovieListResponse>("/search/movie", {
    query,
    page: String(page),
    region: "JP",
  });
}

/**
 * Search movies with automatic English fallback.
 * If Japanese search returns fewer than 5 results,
 * also searches in English and merges deduplicated results.
 */
export async function searchMoviesWithFallback(query: string, page = 1) {
  const jaResults = await searchMovies(query, page);

  if (jaResults.results.length >= 5 || page > 1) {
    return jaResults;
  }

  const enResults = await tmdbFetch<TMDBMovieListResponse>(
    "/search/movie",
    { query, page: String(page) },
    { language: "en-US" }
  );

  const seenIds = new Set(jaResults.results.map((m) => m.id));
  const extra = enResults.results.filter((m) => !seenIds.has(m.id));

  return {
    ...jaResults,
    results: [...jaResults.results, ...extra],
    total_results: jaResults.total_results + extra.length,
  };
}

export async function getMovieDetail(id: number) {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,similar,recommendations",
  });
}

export async function getPopularMovies(page = 1) {
  return tmdbFetch<TMDBMovieListResponse>("/movie/popular", {
    page: String(page),
  });
}

export async function getNowPlayingMovies(page = 1) {
  return tmdbFetch<TMDBMovieListResponse>("/movie/now_playing", {
    page: String(page),
  });
}

export async function searchPeople(query: string, page = 1) {
  return tmdbFetch<TMDBPersonListResponse>("/search/person", {
    query,
    page: String(page),
  });
}

/**
 * Search people with English fallback.
 * Merges Japanese and English results for better partial-name matching.
 */
export async function searchPeopleWithFallback(query: string, page = 1) {
  const [jaResults, enResults] = await Promise.all([
    searchPeople(query, page),
    tmdbFetch<TMDBPersonListResponse>(
      "/search/person",
      { query, page: String(page) },
      { language: "en-US" }
    ),
  ]);

  const seenIds = new Set(jaResults.results.map((p) => p.id));
  const extra = enResults.results.filter((p) => !seenIds.has(p.id));

  return {
    ...jaResults,
    results: [...jaResults.results, ...extra],
    total_results: jaResults.total_results + extra.length,
  };
}

export async function getPersonDetail(id: number) {
  return tmdbFetch<TMDBPersonDetail>(`/person/${id}`, {
    append_to_response: "movie_credits",
  });
}
