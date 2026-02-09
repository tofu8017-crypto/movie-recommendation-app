"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Sparkles } from "lucide-react";
import { tmdbClientFetch } from "@/lib/tmdb/client-proxy";
import type { TMDBMovieListResponse, TMDBCrewMember } from "@/lib/tmdb/types";

interface SimilarDirector {
  id: number;
  name: string;
  profile_path: string | null;
  movieCount: number;
  movieTitles: string[];
}

interface Props {
  movieIds: number[];
  currentDirectorId: number;
}

export function SimilarDirectors({ movieIds, currentDirectorId }: Props) {
  const [directors, setDirectors] = useState<SimilarDirector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function findSimilarDirectors() {
      setIsLoading(true);
      const directorMap = new Map<
        number,
        { name: string; profile_path: string | null; movies: Set<string> }
      >();

      // For each of the director's movies, get recommendations and find their directors
      const BATCH = 3;
      for (let i = 0; i < movieIds.length; i += BATCH) {
        const batch = movieIds.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map((id) =>
            tmdbClientFetch<TMDBMovieListResponse>(
              `/movie/${id}/recommendations`
            )
          )
        );

        // For recommended movies, get their credits to find directors
        const recMovieIds: number[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") {
            recMovieIds.push(...r.value.results.slice(0, 5).map((m) => m.id));
          }
        }

        const creditResults = await Promise.allSettled(
          recMovieIds.slice(0, 10).map((id) =>
            tmdbClientFetch<{ crew: TMDBCrewMember[] }>(
              `/movie/${id}/credits`
            )
          )
        );

        for (let j = 0; j < creditResults.length; j++) {
          const cr = creditResults[j];
          if (cr.status !== "fulfilled") continue;

          const movieDirectors = cr.value.crew.filter(
            (c) => c.job === "Director" && c.id !== currentDirectorId
          );

          for (const d of movieDirectors) {
            const existing = directorMap.get(d.id);
            if (existing) {
              existing.movies.add(String(recMovieIds[j]));
            } else {
              directorMap.set(d.id, {
                name: d.name,
                profile_path: d.profile_path,
                movies: new Set([String(recMovieIds[j])]),
              });
            }
          }
        }
      }

      const sorted = Array.from(directorMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          profile_path: data.profile_path,
          movieCount: data.movies.size,
          movieTitles: [],
        }))
        .sort((a, b) => b.movieCount - a.movieCount)
        .slice(0, 6);

      setDirectors(sorted);
      setIsLoading(false);
    }

    findSimilarDirectors();
  }, [movieIds, currentDirectorId]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          この監督が好きなら...
        </h2>
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          分析中...
        </div>
      </section>
    );
  }

  if (directors.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        この監督が好きならきっとこの監督も
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {directors.map((d) => {
          const profileUrl = d.profile_path
            ? `https://image.tmdb.org/t/p/w185${d.profile_path}`
            : null;

          return (
            <Link
              key={d.id}
              href={`/director/${d.id}`}
              className="flex items-center gap-4 rounded-xl bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-border">
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={d.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Clapperboard className="h-6 w-6 text-foreground-secondary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{d.name}</p>
                <p className="text-xs text-foreground-secondary">
                  関連作品 {d.movieCount}本
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
