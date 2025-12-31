"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      Sign out
    </button>
  );
}
