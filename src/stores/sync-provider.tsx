"use client";
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useWatchedListContext } from "./watched-context";
import { useCloudSync } from "@/hooks/useCloudSync";
import type { WatchedMovie } from "@/types";

interface SyncContextType {
  syncStatus: "idle" | "syncing" | "success" | "error";
  lastSyncTime: Date | null;
  error: string | null;
  isSignedIn: boolean;
  hasMigrated: boolean;
  showMigrationPrompt: boolean;
  confirmMigration: () => Promise<void>;
  dismissMigrationPrompt: () => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const {
    movies,
    setMovies,
    addMovie: localAddMovie,
    removeMovie: localRemoveMovie,
    toggleFavorite: localToggleFavorite,
    updateRating: localUpdateRating,
    updateComment: localUpdateComment,
  } = useWatchedListContext();

  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [pendingMigration, setPendingMigration] = useState(false);

  const onCloudDataLoaded = useCallback((cloudMovies: WatchedMovie[]) => {
    // Merge cloud data with local data
    // Cloud data takes precedence for conflicts
    setMovies((localMovies) => {
      const localMap = new Map(localMovies.map((m) => [m.id, m]));
      const cloudMap = new Map(cloudMovies.map((m) => [m.id, m]));

      // Start with cloud movies
      const merged = [...cloudMovies];

      // Add local movies that aren't in cloud
      localMovies.forEach((localMovie) => {
        if (!cloudMap.has(localMovie.id)) {
          merged.push(localMovie);
        }
      });

      return merged;
    });
  }, [setMovies]);

  const {
    syncStatus,
    lastSyncTime,
    error,
    hasMigrated,
    isSignedIn,
    userId,
    isLoadingFromCloud,
    migrateLocalToCloud,
    syncMovieToCloud,
    deleteMovieFromCloud,
  } = useCloudSync({
    localMovies: movies,
    onCloudDataLoaded,
  });

  // Check if migration prompt should be shown
  useEffect(() => {
    if (isSignedIn && !hasMigrated && movies.length > 0 && !pendingMigration) {
      setShowMigrationPrompt(true);
    } else {
      setShowMigrationPrompt(false);
    }
  }, [isSignedIn, hasMigrated, movies.length, pendingMigration]);

  // Auto-sync changes to cloud when signed in and migrated
  useEffect(() => {
    if (!isSignedIn || !hasMigrated || !userId || isLoadingFromCloud) return;

    // This effect will trigger when movies change
    // We sync the entire list periodically or on changes
    const syncTimeout = setTimeout(() => {
      movies.forEach((movie) => {
        syncMovieToCloud(movie);
      });
    }, 1000); // Debounce sync by 1 second

    return () => clearTimeout(syncTimeout);
  }, [movies, isSignedIn, hasMigrated, userId, isLoadingFromCloud, syncMovieToCloud]);

  const confirmMigration = async () => {
    setPendingMigration(true);
    try {
      await migrateLocalToCloud();
      setShowMigrationPrompt(false);
    } catch (err) {
      console.error("Migration failed:", err);
    } finally {
      setPendingMigration(false);
    }
  };

  const dismissMigrationPrompt = () => {
    setShowMigrationPrompt(false);
    setPendingMigration(true); // Prevent showing again this session
  };

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        lastSyncTime,
        error,
        isSignedIn,
        hasMigrated,
        showMigrationPrompt,
        confirmMigration,
        dismissMigrationPrompt,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within SyncProvider");
  }
  return context;
}
