"use client";
import { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useSyncContext } from "@/stores/sync-provider";
import { motion, AnimatePresence } from "framer-motion";

export function SyncIndicator() {
  const { syncStatus, lastSyncTime, error, isSignedIn } = useSyncContext();
  const [show, setShow] = useState(false);

  // Show indicator temporarily when syncing or when there's an error
  useEffect(() => {
    if (syncStatus === "syncing" || syncStatus === "error") {
      setShow(true);
    } else if (syncStatus === "success") {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  if (!isSignedIn) return null;

  const getIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  const getMessage = () => {
    switch (syncStatus) {
      case "syncing":
        return "同期中...";
      case "success":
        return "同期完了";
      case "error":
        return error || "同期エラー";
      default:
        return lastSyncTime
          ? `最終同期: ${new Date(lastSyncTime).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "同期待機中";
    }
  };

  const getColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "text-primary";
      case "success":
        return "text-green-500";
      case "error":
        return "text-error";
      default:
        return "text-foreground-secondary";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-4 z-40 sm:bottom-20"
        >
          <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 shadow-lg ring-1 ring-border">
            <span className={getColor()}>{getIcon()}</span>
            <span className="text-sm text-foreground-secondary">
              {getMessage()}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
