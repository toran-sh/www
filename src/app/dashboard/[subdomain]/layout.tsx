import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { db } from "@/lib/mongodb";
import { LogoutButton } from "../logout-button";
import { GatewaySidebar } from "@/components/gateway-sidebar";

interface Props {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}

export default async function GatewayLayout({ params, children }: Props) {
  const userId = await getSession();

  if (!userId) {
    // Redirect to clear-session route which clears cookie and redirects to login
    redirect("/api/auth/clear-session");
  }

  const { subdomain } = await params;

  // Verify gateway belongs to user
  const gateway = await db.collection("gateways").findOne({
    subdomain,
    user_id: userId,
  });

  if (!gateway) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-cyan-600 dark:text-cyan-400"
            >
              <img src="/logo.png" alt="toran" className="h-6 w-6" />
              toran
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Gateways
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400">
              {subdomain}
            </code>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        <GatewaySidebar subdomain={subdomain} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
