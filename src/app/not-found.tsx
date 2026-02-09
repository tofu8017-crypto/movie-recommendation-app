import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="ページが見つかりません"
      description="お探しのページは存在しないか、移動した可能性があります"
      actionLabel="ホームに戻る"
      actionHref="/"
    />
  );
}
