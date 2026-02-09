"use client";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchedListContext } from "@/stores/watched-context";

interface WatchedToggleProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
    vote_average: number;
    genre_ids?: number[];
  };
  variant?: "icon" | "button";
}

export function WatchedToggle({ movie, variant = "icon" }: WatchedToggleProps) {
  const { isWatched, toggleMovie } = useWatchedListContext();
  const watched = isWatched(movie.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMovie(movie);
  };

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.85 }}
        className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          watched
            ? "bg-primary text-white"
            : "bg-black/50 text-white/70 hover:text-white"
        }`}
        title={watched ? "視聴済みから削除" : "視聴済みに追加"}
      >
        <motion.div
          animate={watched ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-4 w-4 ${watched ? "fill-current" : ""}`}
          />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
        watched
          ? "bg-primary text-white"
          : "bg-surface text-foreground hover:bg-surface-hover"
      }`}
    >
      <motion.div
        animate={watched ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart className={`h-4 w-4 ${watched ? "fill-current" : ""}`} />
      </motion.div>
      {watched ? "視聴済み" : "視聴済みに追加"}
    </motion.button>
  );
}
