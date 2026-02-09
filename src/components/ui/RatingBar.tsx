import { Star } from "lucide-react";

interface RatingBarProps {
  rating: number;
  size?: "sm" | "md";
}

export function RatingBar({ rating, size = "md" }: RatingBarProps) {
  const percentage = (rating / 10) * 100;
  const isSm = size === "sm";

  return (
    <div className="flex items-center gap-1.5">
      <Star
        className={`fill-accent text-accent ${isSm ? "h-3.5 w-3.5" : "h-4 w-4"}`}
      />
      <span
        className={`font-bold text-accent ${isSm ? "text-xs" : "text-sm"}`}
      >
        {rating.toFixed(1)}
      </span>
      <div
        className={`overflow-hidden rounded-full bg-border ${
          isSm ? "h-1.5 w-12" : "h-2 w-16"
        }`}
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
