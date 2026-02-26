"use client";
import { useEffect, useCallback, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { WatchedMovie } from "@/types";
import {
  fetchWatchedMovies,
  syncMoviesToCloud,
  upsertMovie,
  deleteMovie,
} from "@/lib/supabase/queries";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface UseSyncOptions {
  localMovies: WatchedMovie[];
  onCloudDataLoaded?: (movies: WatchedMovie[]) => void;
}

export function useCloudSync({ localMovies, onCloudDataLoaded }: UseSyncOptions) {
  const { user, isLoaded } = useUser();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [isLoadingFromCloud, setIsLoadingFromCloud] = useState(false);

  // Check if user has already migrated (stored in localStorage)
  const checkMigrationStatus = useCallback(() => {
    if (!user) return false;
    const migrated = localStorage.getItem(`migrated_${user.id}`);
    return migrated === "true";
  }, [user]);

  // Mark as migrated
  const markAsMigrated = useCallback(() => {
    if (!user) return;
    localStorage.setItem(`migrated_${user.id}`, "true");
    setHasMigrated(true);
  }, [user]);

  // Initial sync: Load data from cloud
  const loadFromCloud = useCallback(async () => {
    if (!user) return;

    setIsLoadingFromCloud(true);
    setSyncStatus("syncing");
    setError(null);

    try {
      const cloudMovies = await fetchWatchedMovies(user.id);

      if (onCloudDataLoaded) {
        onCloudDataLoaded(cloudMovies);
      }

      setLastSyncTime(new Date());
      setSyncStatus("success");
    } catch (err: any) {
      console.error("Failed to load from cloud:", err);
      const detail = err?.message || err?.code || JSON.stringify(err);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "(未設定)";
      setError(`同期エラー: ${detail} [URL: ${supabaseUrl.substring(0, 30)}...]`);
      setSyncStatus("error");
    } finally {
      setIsLoadingFromCloud(false);
    }
  }, [user, onCloudDataLoaded]);

  // Migrate local data to cloud
  const migrateLocalToCloud = useCallback(async () => {
    if (!user || localMovies.length === 0) return;

    setSyncStatus("syncing");
    setError(null);

    try {
      await syncMoviesToCloud(user.id, localMovies);
      markAsMigrated();
      setLastSyncTime(new Date());
      setSyncStatus("success");
    } catch (err) {
      console.error("Failed to migrate to cloud:", err);
      setError("クラウドへの移行に失敗しました");
      setSyncStatus("error");
      throw err;
    }
  }, [user, localMovies, markAsMigrated]);

  // Sync a single movie to cloud
  const syncMovieToCloud = useCallback(
    async (movie: WatchedMovie) => {
      if (!user) return;

      try {
        await upsertMovie(user.id, movie);
      } catch (err) {
        console.error("Failed to sync movie to cloud:", err);
      }
    },
    [user]
  );

  // Delete a movie from cloud
  const deleteMovieFromCloud = useCallback(
    async (movieId: number) => {
      if (!user) return;

      try {
        await deleteMovie(user.id, movieId);
      } catch (err) {
        console.error("Failed to delete movie from cloud:", err);
      }
    },
    [user]
  );

  // Initial setup when user logs in
  useEffect(() => {
    if (!isLoaded || !user) {
      setHasMigrated(false);
      return;
    }

    const migrated = checkMigrationStatus();
    setHasMigrated(migrated);

    // Load from cloud on login
    loadFromCloud();
  }, [isLoaded, user, checkMigrationStatus, loadFromCloud]);

  return {
    syncStatus,
    lastSyncTime,
    error,
    hasMigrated,
    isSignedIn: !!user,
    userId: user?.id,
    isLoadingFromCloud,
    loadFromCloud,
    migrateLocalToCloud,
    syncMovieToCloud,
    deleteMovieFromCloud,
  };
}
