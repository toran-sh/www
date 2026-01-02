import Link from "next/link";
import { getSession } from "@/lib/tokens";
import { LogoutButton } from "./logout-button";
import { GatewayList } from "./gateway-list";
import { SessionExpired } from "./session-expired";

export default async function DashboardPage() {
  const userId = await getSession();

  if (!userId) {
    // Render client component that will redirect to clear session
    return <SessionExpired />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-6 w-6" />
            toran
          </Link>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Manage your API gateways</p>
        </div>

        {/* Gateways Section */}
        <div>
          <h2 className="text-lg font-semibold">Your Gateways</h2>
          <GatewayList />
        </div>
      </main>
    </div>
  );
}
