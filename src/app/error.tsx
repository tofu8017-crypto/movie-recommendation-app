"use client";
import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle className="mb-4 h-16 w-16 text-error" />
      <h2 className="mb-2 text-xl font-bold text-foreground">
        エラーが発生しました
      </h2>
      <p className="mb-6 max-w-sm text-foreground-secondary">
        予期しないエラーが発生しました。もう一度お試しください。
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        もう一度試す
      </button>
    </div>
  );
}
