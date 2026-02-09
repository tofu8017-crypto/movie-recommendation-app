"use client";
import { WatchedToggle } from "@/components/movie/WatchedToggle";
import { FavoriteToggle } from "@/components/movie/FavoriteToggle";

interface Props {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    genre_ids?: number[];
  };
}

export function WatchedToggleWrapper({ movie }: Props) {
  return (
    <div className="flex items-center gap-3">
      <WatchedToggle movie={movie} variant="button" />
      <FavoriteToggle movieId={movie.id} variant="button" />
    </div>
  );
}
