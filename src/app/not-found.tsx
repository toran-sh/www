import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Try Now
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Page not found
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-cyan-600 dark:bg-cyan-500 px-6 py-3 text-sm font-medium text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Go home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector — see, search, and understand calls
              without SDKs.
            </div>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link
                href="/pricing"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Pricing
              </Link>
              <Link
                href="/roadmap"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Roadmap
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
