"use client";
import { UserButton as ClerkUserButton, SignInButton, useUser } from "@clerk/nextjs";
import { User } from "lucide-react";

export function UserButton() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-surface" />
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">ログイン</span>
        </button>
      </SignInButton>
    );
  }

  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
          userButtonPopoverCard: "bg-surface shadow-xl",
          userButtonPopoverActionButton: "hover:bg-surface-hover",
        },
      }}
    />
  );
}
