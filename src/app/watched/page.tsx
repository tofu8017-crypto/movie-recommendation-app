"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, Trash2, SortAsc } from "lucide-react";
import { useWatchedListContext } from "@/stores/watched-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { StarRating } from "@/components/ui/StarRating";
import { getPosterUrl } from "@/lib/tmdb/image";

type SortKey = "addedAt" | "vote_average" | "title" | "favorite" | "userRating";

export default function WatchedPage() {
  const { movies, removeMovie, toggleFavorite, isHydrated, favoriteCount } =
    useWatchedListContext();
  const [sortKey, setSortKey] = useState<SortKey>("addedAt");

  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortKey) {
      case "vote_average":
        return b.vote_average - a.vote_average;
      case "title":
        return a.title.localeCompare(b.title, "ja");
      case "favorite":
        return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || b.addedAt - a.addedAt;
      case "userRating":
        return (b.userRating ?? 0) - (a.userRating ?? 0) || b.addedAt - a.addedAt;
      default:
        return b.addedAt - a.addedAt;
    }
  });

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">視聴済みリスト</h1>
          <p className="text-sm text-foreground-secondary">
            {movies.length}本の映画を記録済み
            {favoriteCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-accent">
                <Star className="h-3 w-3 fill-current" />
                {favoriteCount}本のお気に入り
              </span>
            )}
          </p>
        </div>

        {movies.length > 1 && (
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-foreground-secondary" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg bg-surface px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="addedAt">追加日順</option>
              <option value="favorite">お気に入り順</option>
              <option value="userRating">あなたの評価順</option>
              <option value="vote_average">TMDB評価順</option>
              <option value="title">タイトル順</option>
            </select>
          </div>
        )}
      </div>

      {movies.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="まだ映画を記録していません"
          description="映画を検索して「視聴済み」に追加してみましょう"
          actionLabel="映画を探す"
          actionHref="/"
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedMovies.map((movie) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                className={`flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-surface-hover ${
                  movie.isFavorite
                    ? "bg-accent/5 ring-1 ring-accent/20"
                    : "bg-surface"
                }`}
              >
                <Link href={`/movie/${movie.id}`} className="shrink-0">
                  <div className="relative h-20 w-14 overflow-hidden rounded-lg">
                    <Image
                      src={getPosterUrl(movie.poster_path, "w154")}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/movie/${movie.id}`}>
                    <h3 className="truncate font-medium text-foreground hover:text-primary">
                      {movie.title}
                    </h3>
                  </Link>
                  <div className="mt-1">
                    {movie.userRating !== undefined ? (
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={movie.userRating}
                          readonly
                          size="sm"
                        />
                        <span className="text-xs text-foreground-secondary">
                          (TMDB: {Math.round(movie.vote_average * 10) / 10})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-foreground-secondary">
                          TMDB:
                        </span>
                        <StarRating
                          rating={Math.round(movie.vote_average / 2)}
                          readonly
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                  {movie.comment && (
                    <p className="mt-1 line-clamp-2 text-xs text-foreground-secondary">
                      {movie.comment}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-foreground-secondary">
                    {new Date(movie.addedAt).toLocaleDateString("ja-JP")}に追加
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(movie.id)}
                    className={`rounded-lg p-2 transition-colors ${
                      movie.isFavorite
                        ? "text-accent hover:bg-accent/10"
                        : "text-foreground-secondary hover:bg-surface hover:text-accent"
                    }`}
                    title={movie.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
                  >
                    <Star
                      className={`h-4 w-4 ${movie.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => removeMovie(movie.id)}
                    className="shrink-0 rounded-lg p-2 text-foreground-secondary transition-colors hover:bg-error/10 hover:text-error"
                    title="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
