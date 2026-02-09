"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchInputProps {
  size?: "default" | "large";
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  size = "default",
  placeholder = "映画・監督・俳優を検索...",
  autoFocus = false,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary ${
            isLarge ? "h-6 w-6" : "h-5 w-5"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full rounded-2xl bg-surface text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary ${
            isLarge
              ? "h-16 pl-14 pr-6 text-lg"
              : "h-12 pl-12 pr-4 text-base"
          }`}
        />
      </div>
    </form>
  );
}
