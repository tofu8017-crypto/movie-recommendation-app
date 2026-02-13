"use client";
import { WatchedListProvider } from "@/stores/watched-context";
import { SyncProvider } from "@/stores/sync-provider";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { MigrationPrompt } from "@/components/sync/MigrationPrompt";
import { SyncIndicator } from "@/components/sync/SyncIndicator";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WatchedListProvider>
      <SyncProvider>
        <Header />
        <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 pt-6 sm:pb-8">
          {children}
        </main>
        <MobileNav />
        <MigrationPrompt />
        <SyncIndicator />
      </SyncProvider>
    </WatchedListProvider>
  );
}
