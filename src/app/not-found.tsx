import Link from "next/link";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-sky-600 dark:text-sky-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="bg-sky-600 dark:bg-sky-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
          >
            Try Now
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20 flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-bold text-sky-600 dark:text-sky-400 mb-2">
            404
          </h1>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
            Page not found
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-block bg-sky-600 dark:bg-sky-500 px-6 py-3 text-sm font-medium text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
          >
            Go home
          </Link>
        </div>
      </main>

      <Footer className="mt-0" />
    </div>
  );
}
