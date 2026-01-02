import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { CreateTrialForm } from "./create-trial-form";
import { Footer } from "@/components/footer";

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

      <Footer className="mt-32" />
    </div>
  );
}
