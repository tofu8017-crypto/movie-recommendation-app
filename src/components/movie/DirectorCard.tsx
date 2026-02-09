import Image from "next/image";
import Link from "next/link";
import { Clapperboard, User } from "lucide-react";
import type { TMDBPerson } from "@/lib/tmdb/types";

interface PersonCardProps {
  person: TMDBPerson;
  type: "director" | "actor";
}

export function DirectorCard({ person, type = "director" }: PersonCardProps) {
  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
    : null;

  const href = type === "director" ? `/director/${person.id}` : `/actor/${person.id}`;
  const label = type === "director" ? "監督" : "俳優";
  const Icon = type === "director" ? Clapperboard : User;

  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-hover"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-border">
        {profileUrl ? (
          <Image
            src={profileUrl}
            alt={person.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-6 w-6 text-foreground-secondary" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{person.name}</p>
        <p className="text-xs text-foreground-secondary">{label}</p>
      </div>
    </Link>
  );
}
