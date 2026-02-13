"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Film, Heart, Sparkles } from "lucide-react";
import { useWatchedListContext } from "@/stores/watched-context";
import { UserButton } from "@/components/auth/UserButton";

export function Header() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { count } = useWatchedListContext();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-primary transition-colors hover:text-primary-hover"
        >
          <Film className="h-6 w-6" />
          <span className="hidden text-lg font-bold sm:block">映画おすすめ</span>
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="映画・監督・俳優を検索..."
              className="h-10 w-full rounded-full bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            href="/watched"
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground"
          >
            <Heart className="h-4 w-4" />
            <span>視聴済み</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/recommendations"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-foreground-secondary transition-colors hover:bg-surface hover:text-foreground"
          >
            <Sparkles className="h-4 w-4" />
            <span>おすすめ</span>
          </Link>
        </nav>

        <UserButton />
      </div>
    </header>
  );
}
