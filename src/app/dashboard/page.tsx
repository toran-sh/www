import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { LogoutButton } from "./logout-button";
import { ToranList } from "./toran-list";
import { DashboardMetrics } from "./dashboard-metrics";

export default async function DashboardPage() {
  const userId = await getSession();

  if (!userId) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">Manage your torans</p>
        </div>

        {/* Metrics Section */}
        <DashboardMetrics />

        {/* Torans Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Your torans</h2>
          <ToranList />
        </div>
      </main>
    </div>
  );
}
