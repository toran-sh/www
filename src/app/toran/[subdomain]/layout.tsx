import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { db } from "@/lib/mongodb";
import { LogoutButton } from "@/app/dashboard/logout-button";
import { ToranSidebar } from "@/components/toran-sidebar";

interface Props {
  params: Promise<{ subdomain: string }>;
  children: React.ReactNode;
}

export default async function ToranLayout({ params, children }: Props) {
  const userId = await getSession();

  if (!userId) {
    redirect("/login");
  }

  const { subdomain } = await params;

  // Verify toran belongs to user
  const toran = await db.collection("gateways").findOne({
    subdomain,
    user_id: userId,
  });

  if (!toran) {
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
              className="flex items-center gap-3 text-3xl font-bold text-violet-600 dark:text-violet-400"
            >
              <img src="/logo.png" alt="toran" className="h-10 w-10" />
              toran
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              torans
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <code className="text-sm font-mono text-violet-600 dark:text-violet-400">
              {subdomain}
            </code>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex">
        <ToranSidebar subdomain={subdomain} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
