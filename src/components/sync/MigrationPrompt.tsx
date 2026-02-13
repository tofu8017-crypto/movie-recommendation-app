"use client";
import { Cloud, X } from "lucide-react";
import { useSyncContext } from "@/stores/sync-provider";
import { motion, AnimatePresence } from "framer-motion";

export function MigrationPrompt() {
  const { showMigrationPrompt, confirmMigration, dismissMigrationPrompt } =
    useSyncContext();

  return (
    <AnimatePresence>
      {showMigrationPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-50 sm:bottom-8 sm:left-auto sm:right-8 sm:max-w-md"
        >
          <div className="rounded-xl border border-primary/20 bg-surface p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Cloud className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  クラウド同期を有効にしますか？
                </h3>
                <p className="mt-1 text-sm text-foreground-secondary">
                  このデバイスに保存されている視聴済みリストをクラウドに同期すると、他のデバイスからもアクセスできるようになります。
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={confirmMigration}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    同期する
                  </button>
                  <button
                    onClick={dismissMigrationPrompt}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground-secondary transition-colors hover:bg-surface-hover"
                  >
                    後で
                  </button>
                </div>
              </div>
              <button
                onClick={dismissMigrationPrompt}
                className="shrink-0 rounded-lg p-1 text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
