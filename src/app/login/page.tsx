"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Check your email</h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          We sent a magic link to <span className="text-zinc-900 dark:text-white">{email}</span>
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Click the link in the email to sign in. The link expires in 15 minutes.
        </p>
        <button
          onClick={() => {
            setIsSent(false);
            setEmail("");
          }}
          className="mt-8 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Get Started</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Enter your email to sign in or create an account
      </p>

      {(error || urlError) && (
        <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error ||
            (urlError === "missing_token"
              ? "Invalid login link. Please request a new one."
              : urlError === "invalid_token"
              ? "This link has expired or already been used. Please request a new one."
              : "An error occurred. Please try again.")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="mt-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Continue with Email"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        We&apos;ll send you a magic link to sign in instantly. No password needed.
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to home
        </Link>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8">
          <Suspense fallback={<div className="text-center text-zinc-600 dark:text-zinc-400">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500 dark:text-zinc-600">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
