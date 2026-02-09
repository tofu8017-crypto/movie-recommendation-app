"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useWatchedList } from "@/hooks/useWatchedList";

type WatchedListContextType = ReturnType<typeof useWatchedList>;

const WatchedListContext = createContext<WatchedListContextType | null>(null);

export function WatchedListProvider({ children }: { children: ReactNode }) {
  const watchedList = useWatchedList();
  return (
    <WatchedListContext.Provider value={watchedList}>
      {children}
    </WatchedListContext.Provider>
  );
}

export function useWatchedListContext() {
  const context = useContext(WatchedListContext);
  if (!context) {
    throw new Error(
      "useWatchedListContext must be used within WatchedListProvider"
    );
  }
  return context;
}
