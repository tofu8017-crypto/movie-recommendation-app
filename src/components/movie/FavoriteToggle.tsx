"use client";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchedListContext } from "@/stores/watched-context";

interface FavoriteToggleProps {
  movieId: number;
  variant?: "icon" | "button";
}

export function FavoriteToggle({ movieId, variant = "icon" }: FavoriteToggleProps) {
  const { isWatched, isFavorite, toggleFavorite } = useWatchedListContext();

  if (!isWatched(movieId)) return null;

  const favorite = isFavorite(movieId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movieId);
  };

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.85 }}
        className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          favorite
            ? "bg-accent text-white"
            : "bg-black/50 text-white/70 hover:text-white"
        }`}
        title={favorite ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <motion.div
          animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
        favorite
          ? "bg-accent text-white"
          : "bg-surface text-foreground hover:bg-surface-hover"
      }`}
    >
      <motion.div
        animate={favorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Star className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
      </motion.div>
      {favorite ? "お気に入り" : "お気に入りに追加"}
    </motion.button>
  );
}
