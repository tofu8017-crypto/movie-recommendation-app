import { type LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="mb-4 h-16 w-16 text-foreground-secondary/50" />
      <h2 className="mb-2 text-xl font-bold text-foreground">{title}</h2>
      <p className="mb-6 max-w-sm text-foreground-secondary">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
