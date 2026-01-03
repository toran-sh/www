import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { LoginForm } from "./login-form";
import { Footer } from "@/components/footer";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  // If already logged in with valid session, redirect to dashboard
  const userId = await getSession();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-sky-600 dark:text-sky-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Sign in
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Enter your email to receive a magic link
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 p-8">
            <LoginForm urlError={error} />
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t want to create an account?{" "}
            <Link
              href="/try"
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              Try toran free
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-600">
            By continuing, you agree to our{" "}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>

      <Footer className="mt-32" />
    </div>
  );
}
