"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Film, TrendingUp, Star, Tag } from "lucide-react";
import { useWatchedListContext } from "@/stores/watched-context";
import { EmptyState } from "@/components/ui/EmptyState";
import { RatingBar } from "@/components/ui/RatingBar";
import { WatchedToggle } from "@/components/movie/WatchedToggle";
import { getPosterUrl } from "@/lib/tmdb/image";
import {
  generateRecommendations,
  type ScoredMovie,
  type GenreProfile,
  type RecommendationProgress,
} from "@/lib/recommendations/engine";

/** TMDB genre ID -> Japanese name mapping */
const GENRE_NAMES: Record<number, string> = {
  28: "アクション",
  12: "アドベンチャー",
  16: "アニメーション",
  35: "コメディ",
  80: "犯罪",
  99: "ドキュメンタリー",
  18: "ドラマ",
  10751: "ファミリー",
  14: "ファンタジー",
  36: "歴史",
  27: "ホラー",
  10402: "音楽",
  9648: "ミステリー",
  10749: "ロマンス",
  878: "SF",
  10770: "テレビ映画",
  53: "スリラー",
  10752: "戦争",
  37: "西部劇",
};

export default function RecommendationsPage() {
  const { movies: watchedMovies, favoriteIds, favoriteCount, isHydrated } = useWatchedListContext();
  const [recommendations, setRecommendations] = useState<ScoredMovie[]>([]);
  const [genreProfile, setGenreProfile] = useState<GenreProfile | null>(null);
  const [progress, setProgress] = useState<RecommendationProgress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    if (watchedMovies.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRecommendations(watchedMovies, favoriteIds, setProgress);
      setRecommendations(result.movies);
      setGenreProfile(result.genreProfile);
    } catch {
      setError("おすすめの取得中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  }, [watchedMovies, favoriteIds]);

  useEffect(() => {
    if (isHydrated && watchedMovies.length > 0) {
      loadRecommendations();
    }
  }, [isHydrated, loadRecommendations, watchedMovies.length]);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (watchedMovies.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="まだ映画を記録していません"
        description="おすすめを表示するには、まず視聴した映画を登録してください"
        actionLabel="映画を探す"
        actionHref="/"
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Sparkles className="h-6 w-6 text-primary" />
            あなたへのおすすめ
          </h1>
          <p className="text-sm text-foreground-secondary">
            {watchedMovies.length}本の視聴履歴から分析
            {favoriteCount > 0 && (
              <span className="ml-1 inline-flex items-center gap-1 text-accent">
                (<Star className="inline h-3 w-3 fill-current" />{favoriteCount}本を重視)
              </span>
            )}
          </p>
        </div>
        {!isLoading && recommendations.length > 0 && (
          <button
            onClick={loadRecommendations}
            className="rounded-lg bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
          >
            再分析
          </button>
        )}
      </div>

      {/* Genre Profile */}
      {!isLoading && genreProfile && genreProfile.topGenreIds.length > 0 && (
        <div className="mb-6 rounded-xl bg-surface p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            あなたのジャンル傾向
          </h3>
          <div className="flex flex-wrap gap-2">
            {genreProfile.topGenreIds.map((gid, i) => {
              const weight = genreProfile.weights.get(gid) ?? 0;
              const name = GENRE_NAMES[gid] ?? `ID:${gid}`;
              return (
                <span
                  key={gid}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `rgba(99, 102, 241, ${0.15 + weight * 0.35})`,
                    color: i === 0 ? "rgb(165, 180, 252)" : "rgb(148, 163, 184)",
                  }}
                >
                  {name}
                  <span className="opacity-70">{Math.round(weight * 100)}%</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress */}
      {isLoading && progress && (
        <div className="mb-8 rounded-xl bg-surface p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground">
              {progress.phase === "fetching"
                ? "映画データを取得中..."
                : "スコアを計算中..."}
            </span>
            <span className="text-foreground-secondary">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{
                width: `${
                  progress.total > 0
                    ? (progress.current / progress.total) * 100
                    : 0
                }%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {isLoading && !progress && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
          <button
            onClick={loadRecommendations}
            className="ml-2 underline hover:no-underline"
          >
            再試行
          </button>
        </div>
      )}

      {/* Results */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group flex gap-4 rounded-xl bg-surface p-4 transition-colors hover:bg-surface-hover"
            >
              <Link href={`/movie/${movie.id}`} className="shrink-0">
                <div className="relative h-28 w-20 overflow-hidden rounded-lg">
                  <Image
                    src={getPosterUrl(movie.poster_path, "w185")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <Link href={`/movie/${movie.id}`}>
                    <h3 className="line-clamp-2 font-medium text-foreground hover:text-primary">
                      {movie.title}
                    </h3>
                  </Link>
                  <div className="mt-1">
                    <RatingBar rating={movie.vote_average} size="sm" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-foreground-secondary">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      マッチ度: {Math.round(movie.recommendationScore * 100)}%
                    </span>
                    {movie.genreMatchScore > 0 && (
                      <span className="flex items-center gap-1 text-primary/80">
                        <Tag className="h-3 w-3" />
                        ジャンル適合: {Math.round(movie.genreMatchScore * 100)}%
                      </span>
                    )}
                    {movie.fromFavorite && (
                      <span className="flex items-center gap-0.5 text-accent">
                        <Star className="h-3 w-3 fill-current" />
                        お気に入りから
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-foreground-secondary">
                    {movie.release_date?.split("-")[0]}
                  </span>
                  <WatchedToggle movie={movie} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && !error && recommendations.length === 0 && watchedMovies.length > 0 && (
        <EmptyState
          icon={Sparkles}
          title="おすすめが見つかりませんでした"
          description="もう少し多くの映画を視聴済みに追加すると、より良いおすすめが見つかります"
          actionLabel="映画を探す"
          actionHref="/"
        />
      )}
    </div>
  );
}
