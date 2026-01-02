import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { CreateTrialForm } from "./create-trial-form";

export default async function TryPage() {
  // Redirect logged-in users to dashboard
  const userId = await getSession();
  if (userId) {
    redirect("/dashboard");
  }

  // Trial token is initialized by middleware to prevent race conditions
  // when creating torans in multiple tabs

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/login"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Try toran
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              No signup required. Create a toran, point your tool, client or agent at it, and inspect requests instantly.
            </p>
          </div>

          <CreateTrialForm />

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto mt-32 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector - see, search, and understand calls
              without SDKs.
            </div>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link
                href="/pricing"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Pricing
              </Link>
              <a
                href="/privacy"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
