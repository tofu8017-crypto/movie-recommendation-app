"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb/image";
import { RatingBar } from "@/components/ui/RatingBar";
import { WatchedToggle } from "./WatchedToggle";
import { FavoriteToggle } from "./FavoriteToggle";
import type { TMDBMovie } from "@/lib/tmdb/types";

interface MovieCardProps {
  movie: TMDBMovie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const year = movie.release_date?.split("-")[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link href={`/movie/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface">
          <Image
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <RatingBar rating={movie.vote_average} size="sm" />
              {movie.overview && (
                <p className="mt-2 line-clamp-3 text-xs text-white/80">
                  {movie.overview}
                </p>
              )}
            </div>
          </div>
          {/* Toggles */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <WatchedToggle movie={movie} />
            <FavoriteToggle movieId={movie.id} />
          </div>
        </div>
        <div className="mt-2 px-1">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground">
            {movie.title}
          </h3>
          <p className="text-xs text-foreground-secondary">{year}</p>
        </div>
      </Link>
    </motion.div>
  );
}
