"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";
import { tmdbClientFetch } from "@/lib/tmdb/client-proxy";
import type { TMDBMovieListResponse, TMDBCastMember } from "@/lib/tmdb/types";

interface SimilarActor {
  id: number;
  name: string;
  profile_path: string | null;
  movieCount: number;
}

interface Props {
  movieIds: number[];
  currentActorId: number;
}

export function SimilarActors({ movieIds, currentActorId }: Props) {
  const [actors, setActors] = useState<SimilarActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function findSimilarActors() {
      setIsLoading(true);
      const actorMap = new Map<
        number,
        { name: string; profile_path: string | null; movies: Set<number> }
      >();

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

        const recMovieIds: number[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") {
            recMovieIds.push(...r.value.results.slice(0, 5).map((m) => m.id));
          }
        }

        const creditResults = await Promise.allSettled(
          recMovieIds.slice(0, 10).map((id) =>
            tmdbClientFetch<{ cast: TMDBCastMember[] }>(
              `/movie/${id}/credits`
            )
          )
        );

        for (let j = 0; j < creditResults.length; j++) {
          const cr = creditResults[j];
          if (cr.status !== "fulfilled") continue;

          const topCast = cr.value.cast
            .filter((c) => c.order < 5 && c.id !== currentActorId);

          for (const a of topCast) {
            const existing = actorMap.get(a.id);
            if (existing) {
              existing.movies.add(recMovieIds[j]);
            } else {
              actorMap.set(a.id, {
                name: a.name,
                profile_path: a.profile_path,
                movies: new Set([recMovieIds[j]]),
              });
            }
          }
        }
      }

      const sorted = Array.from(actorMap.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          profile_path: data.profile_path,
          movieCount: data.movies.size,
        }))
        .sort((a, b) => b.movieCount - a.movieCount)
        .slice(0, 6);

      setActors(sorted);
      setIsLoading(false);
    }

    findSimilarActors();
  }, [movieIds, currentActorId]);

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          この俳優が好きなら...
        </h2>
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          分析中...
        </div>
      </section>
    );
  }

  if (actors.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
        <Sparkles className="h-5 w-5 text-primary" />
        この俳優が好きならきっとこの俳優も
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actors.map((a) => {
          const profileUrl = a.profile_path
            ? `https://image.tmdb.org/t/p/w185${a.profile_path}`
            : null;

          return (
            <Link
              key={a.id}
              href={`/actor/${a.id}`}
              className="flex items-center gap-4 rounded-xl bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-border">
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={a.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-6 w-6 text-foreground-secondary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{a.name}</p>
                <p className="text-xs text-foreground-secondary">
                  関連作品 {a.movieCount}本
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
