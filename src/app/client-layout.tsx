"use client";
import { WatchedListProvider } from "@/stores/watched-context";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WatchedListProvider>
      <Header />
      <main className="mx-auto min-h-screen max-w-7xl px-4 pb-20 pt-6 sm:pb-8">
        {children}
      </main>
      <MobileNav />
    </WatchedListProvider>
  );
}
