"use client";
import { useWatchedListContext } from "@/stores/watched-context";
import { StarRating } from "@/components/ui/StarRating";
import { CommentInput } from "@/components/ui/CommentInput";

interface Props {
  movieId: number;
}

export function RatingCommentSection({ movieId }: Props) {
  const { isWatched, getMovie, updateRating, updateComment } =
    useWatchedListContext();

  const watched = isWatched(movieId);
  const movie = getMovie(movieId);

  if (!watched || !movie) return null;

  return (
    <div className="space-y-4 rounded-xl bg-surface p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          あなたの評価
        </label>
        <StarRating
          rating={movie.userRating}
          onChange={(rating) => updateRating(movieId, rating)}
          size="lg"
          showLabel
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          感想
        </label>
        <CommentInput
          value={movie.comment}
          onChange={(comment) => updateComment(movieId, comment)}
          placeholder="この映画の感想を書く..."
        />
      </div>
    </div>
  );
}
