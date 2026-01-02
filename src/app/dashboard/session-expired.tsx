"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SessionExpired() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to clear-session API which will clear cookie and redirect to login
    router.replace("/api/auth/clear-session");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-center">
        <p className="text-zinc-600 dark:text-zinc-400">Session expired. Redirecting to login...</p>
      </div>
    </div>
  );
}
