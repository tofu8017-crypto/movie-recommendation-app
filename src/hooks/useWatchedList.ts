"use client";
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { WatchedMovie } from "@/types";

const STORAGE_KEY = "movie-recommender-watched";

export function useWatchedList() {
  const [movies, setMovies, isHydrated] = useLocalStorage<WatchedMovie[]>(
    STORAGE_KEY,
    []
  );

  const watchedIds = useMemo(
    () => new Set(movies.map((m) => m.id)),
    [movies]
  );

  const favoriteIds = useMemo(
    () => new Set(movies.filter((m) => m.isFavorite).map((m) => m.id)),
    [movies]
  );

  const isWatched = useCallback(
    (movieId: number) => watchedIds.has(movieId),
    [watchedIds]
  );

  const isFavorite = useCallback(
    (movieId: number) => favoriteIds.has(movieId),
    [favoriteIds]
  );

  const addMovie = useCallback(
    (movie: Omit<WatchedMovie, "addedAt" | "isFavorite">) => {
      setMovies((prev) => {
        if (prev.some((m) => m.id === movie.id)) return prev;
        return [
          ...prev,
          {
            ...movie,
            genre_ids: movie.genre_ids ?? [],
            addedAt: Date.now(),
            isFavorite: false,
          },
        ];
      });
    },
    [setMovies]
  );

  const removeMovie = useCallback(
    (movieId: number) => {
      setMovies((prev) => prev.filter((m) => m.id !== movieId));
    },
    [setMovies]
  );

  const toggleMovie = useCallback(
    (movie: Omit<WatchedMovie, "addedAt" | "isFavorite">) => {
      if (watchedIds.has(movie.id)) {
        removeMovie(movie.id);
      } else {
        addMovie(movie);
      }
    },
    [watchedIds, addMovie, removeMovie]
  );

  const toggleFavorite = useCallback(
    (movieId: number) => {
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, isFavorite: !m.isFavorite } : m
        )
      );
    },
    [setMovies]
  );

  const updateRating = useCallback(
    (movieId: number, rating: number | undefined) => {
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, userRating: rating } : m
        )
      );
    },
    [setMovies]
  );

  const updateComment = useCallback(
    (movieId: number, comment: string | undefined) => {
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movieId ? { ...m, comment } : m
        )
      );
    },
    [setMovies]
  );

  const getMovie = useCallback(
    (movieId: number) => movies.find((m) => m.id === movieId),
    [movies]
  );

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(movies, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `movie-list-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [movies]);

  const importData = useCallback(
    (file: File) => {
      return new Promise<{ success: boolean; count: number }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedMovies = JSON.parse(e.target?.result as string) as WatchedMovie[];

            // Validate data structure
            if (!Array.isArray(importedMovies)) {
              throw new Error("Invalid data format");
            }

            // Merge with existing data, avoiding duplicates
            setMovies((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const newMovies = importedMovies.filter((m) => !existingIds.has(m.id));
              return [...prev, ...newMovies];
            });

            resolve({ success: true, count: importedMovies.length });
          } catch (error) {
            reject(new Error("Invalid JSON file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    },
    [setMovies]
  );

  return {
    movies,
    watchedIds,
    favoriteIds,
    isWatched,
    isFavorite,
    addMovie,
    removeMovie,
    toggleMovie,
    toggleFavorite,
    updateRating,
    updateComment,
    getMovie,
    exportData,
    importData,
    isHydrated,
    count: movies.length,
    favoriteCount: favoriteIds.size,
  };
}
