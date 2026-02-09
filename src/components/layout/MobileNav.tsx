"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Sparkles, Search } from "lucide-react";
import { useWatchedListContext } from "@/stores/watched-context";

const navItems = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/search", label: "検索", icon: Search },
  { href: "/watched", label: "視聴済み", icon: Heart },
  { href: "/recommendations", label: "おすすめ", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();
  const { count } = useWatchedListContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl sm:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.href === "/watched" && count > 0 && (
                <span className="absolute -top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
