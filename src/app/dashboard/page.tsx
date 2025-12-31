import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const email = await getSession();

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            toran
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Welcome to your toran dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Gateways</div>
            <div className="mt-2 text-3xl font-bold">0</div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">API Requests (24h)</div>
            <div className="mt-2 text-3xl font-bold">0</div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Cache Hit Rate</div>
            <div className="mt-2 text-3xl font-bold">--%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button className="flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-zinc-400 dark:hover:border-zinc-600">
              <div className="flex h-10 w-10 items-center justify-center border border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">Create Gateway</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Set up a new API gateway</div>
              </div>
            </button>

            <button className="flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-zinc-400 dark:hover:border-zinc-600">
              <div className="flex h-10 w-10 items-center justify-center border border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Monitor your API traffic</div>
              </div>
            </button>

            <button className="flex items-center gap-4 border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-zinc-400 dark:hover:border-zinc-600">
              <div className="flex h-10 w-10 items-center justify-center border border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-medium">Settings</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">Manage your account</div>
              </div>
            </button>
          </div>
        </div>

        {/* Empty State for Gateways */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold">Your Gateways</h2>
          <div className="mt-6 border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="font-medium">No gateways yet</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Create your first gateway to start routing API requests
            </p>
            <button className="mt-6 bg-cyan-600 dark:bg-cyan-500 px-6 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400">
              Create Gateway
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
