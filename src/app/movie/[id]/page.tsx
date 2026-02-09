import { notFound } from "next/navigation";
import Image from "next/image";
import { getMovieDetail } from "@/lib/tmdb/endpoints";
import { getPosterUrl, getBackdropUrl } from "@/lib/tmdb/image";
import { StarRating } from "@/components/ui/StarRating";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { WatchedToggleWrapper } from "./watched-toggle-wrapper";
import { RatingCommentSection } from "./rating-comment-section";
import { Clock, Calendar, Globe } from "lucide-react";
import type { Metadata } from "next";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetail(Number(id));
    return {
      title: `${movie.title} | おすすめな映画をおしえてくれるやつ`,
      description: movie.overview,
    };
  } catch {
    return { title: "映画が見つかりません" };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  let movie;
  try {
    movie = await getMovieDetail(Number(id));
  } catch {
    notFound();
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const director = movie.credits?.crew?.find((c) => c.job === "Director");
  const topCast = movie.credits?.cast?.slice(0, 6) || [];

  return (
    <div>
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative -mx-4 -mt-6 mb-8 h-64 overflow-hidden sm:h-80 md:h-96">
          <Image
            src={backdropUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      {/* Detail */}
      <div className="flex flex-col gap-8 sm:flex-row">
        {/* Poster */}
        <div className="shrink-0 sm:w-64">
          <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-xl shadow-2xl sm:w-full">
            <Image
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="mb-1 text-2xl font-bold text-foreground sm:text-3xl">
            {movie.title}
          </h1>
          {movie.tagline && (
            <p className="mb-3 text-sm italic text-foreground-secondary">
              {movie.tagline}
            </p>
          )}

          {/* Genres */}
          <div className="mb-4 flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <span
                key={g.id}
                className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-foreground-secondary"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Metadata */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-foreground-secondary">
            {movie.release_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {movie.release_date}
              </span>
            )}
            {movie.runtime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {movie.runtime}分
              </span>
            )}
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              {movie.original_language.toUpperCase()}
            </span>
          </div>

          {/* TMDB Rating */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                TMDB評価:
              </span>
              <StarRating
                rating={Math.round(movie.vote_average / 2)}
                readonly
                size="md"
                showLabel
              />
              <span className="text-xs text-foreground-secondary">
                ({movie.vote_count.toLocaleString()}件)
              </span>
            </div>
          </div>

          {/* Watched Toggle */}
          <div className="mb-6">
            <WatchedToggleWrapper
              movie={{
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                genre_ids: movie.genres.map((g) => g.id),
              }}
            />
          </div>

          {/* User Rating & Comment */}
          <div className="mb-6">
            <RatingCommentSection movieId={movie.id} />
          </div>

          {/* Overview */}
          {movie.overview && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-bold text-foreground">
                あらすじ
              </h2>
              <p className="leading-relaxed text-foreground-secondary">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Director */}
          {director && (
            <p className="mb-2 text-sm text-foreground-secondary">
              <span className="font-medium text-foreground">監督:</span>{" "}
              {director.name}
            </p>
          )}

          {/* Cast */}
          {topCast.length > 0 && (
            <p className="text-sm text-foreground-secondary">
              <span className="font-medium text-foreground">出演:</span>{" "}
              {topCast.map((c) => c.name).join("、")}
            </p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {movie.recommendations && movie.recommendations.results.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            おすすめの映画
          </h2>
          <MovieGrid movies={movie.recommendations.results.slice(0, 10)} />
        </section>
      )}

      {/* Similar */}
      {movie.similar && movie.similar.results.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            似ている映画
          </h2>
          <MovieGrid movies={movie.similar.results.slice(0, 10)} />
        </section>
      )}
    </div>
  );
}
