"use client";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface StarRatingProps {
  rating?: number; // 0-5, undefined = not rated
  onChange?: (rating: number | undefined) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StarRating({
  rating,
  onChange,
  readonly = false,
  size = "md",
  showLabel = false,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const handleClick = (star: number) => {
    if (readonly || !onChange) return;
    // Clicking the same star clears the rating
    onChange(rating === star ? undefined : star);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const filled = rating !== undefined && star <= rating;
          return (
            <motion.button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              disabled={readonly}
              whileHover={readonly ? {} : { scale: 1.2 }}
              whileTap={readonly ? {} : { scale: 0.9 }}
              className={`transition-colors ${
                readonly
                  ? "cursor-default"
                  : "cursor-pointer hover:text-accent"
              }`}
              aria-label={`${star}つ星`}
            >
              <Star
                className={`${sizeClass} ${
                  filled
                    ? "fill-accent text-accent"
                    : "fill-none text-foreground-secondary"
                }`}
              />
            </motion.button>
          );
        })}
      </div>
      {showLabel && (
        <span className="text-sm text-foreground-secondary">
          {rating !== undefined ? `${rating}.0` : "未評価"}
        </span>
      )}
    </div>
  );
}
