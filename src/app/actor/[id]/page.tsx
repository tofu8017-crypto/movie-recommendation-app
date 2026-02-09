import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPersonDetail } from "@/lib/tmdb/endpoints";
import { getProfileUrl, getPosterUrl } from "@/lib/tmdb/image";
import { RatingBar } from "@/components/ui/RatingBar";
import { SimilarActors } from "./similar-actors";
import { User, MapPin, Calendar } from "lucide-react";
import type { Metadata } from "next";

interface ActorPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ActorPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPersonDetail(Number(id));
    return {
      title: `${person.name} | おすすめな映画をおしえてくれるやつ`,
      description: person.biography || `${person.name}の出演作品一覧`,
    };
  } catch {
    return { title: "俳優が見つかりません" };
  }
}

export default async function ActorPage({ params }: ActorPageProps) {
  const { id } = await params;
  let person;
  try {
    person = await getPersonDetail(Number(id));
  } catch {
    notFound();
  }

  const profileUrl = getProfileUrl(person.profile_path);

  // Get acted movies, sorted by vote_average (descending), deduplicated
  const seenIds = new Set<number>();
  const actedMovies =
    person.movie_credits?.cast
      ?.filter((c) => {
        if (seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      })
      .sort((a, b) => b.vote_average - a.vote_average) || [];

  const movieIds = actedMovies.slice(0, 10).map((m) => m.id);

  return (
    <div>
      {/* Profile section */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl bg-surface">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt={person.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-16 w-16 text-foreground-secondary/50" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            {person.name}
          </h1>

          <div className="mb-3 flex flex-wrap items-center justify-center gap-3 text-sm text-foreground-secondary sm:justify-start">
            {person.birthday && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {person.birthday}
                {person.deathday && ` — ${person.deathday}`}
              </span>
            )}
            {person.place_of_birth && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {person.place_of_birth}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground-secondary">
            出演作品: {actedMovies.length}本
          </p>

          {person.biography && (
            <p className="mt-4 line-clamp-6 leading-relaxed text-foreground-secondary">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      {/* Filmography */}
      {actedMovies.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">出演作品</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {actedMovies.map((movie) => (
              <Link
                key={`${movie.id}-${movie.character}`}
                href={`/movie/${movie.id}`}
                className="flex gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-hover"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={getPosterUrl(movie.poster_path, "w154")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center min-w-0">
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground">
                    {movie.title}
                  </h3>
                  {movie.character && (
                    <p className="text-xs text-primary">{movie.character} 役</p>
                  )}
                  <p className="text-xs text-foreground-secondary">
                    {movie.release_date?.split("-")[0] || "公開日不明"}
                  </p>
                  {movie.vote_average > 0 && (
                    <div className="mt-1">
                      <RatingBar rating={movie.vote_average} size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Similar Actors */}
      {movieIds.length > 0 && (
        <SimilarActors movieIds={movieIds} currentActorId={person.id} />
      )}
    </div>
  );
}
