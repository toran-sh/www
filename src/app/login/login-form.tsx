"use client";

import { useState } from "react";

interface LoginFormProps {
  urlError?: string;
}

export function LoginForm({ urlError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-cyan-600 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Check your email</h2>
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
          className="mt-8 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  const errorMessage = error || (urlError === "missing_token"
    ? "Invalid login link. Please request a new one."
    : urlError === "invalid_token"
    ? "This link has expired or already been used. Please request a new one."
    : urlError
    ? "An error occurred. Please try again."
    : null);

  return (
    <>
      <h1 className="text-2xl font-bold">Get Started</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Enter your email to sign in or create an account
      </p>

      {errorMessage && (
        <div className="mt-6 border border-red-500 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8">
        <label htmlFor="email" className="block text-sm text-zinc-700 dark:text-zinc-300">
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-cyan-600 dark:bg-cyan-500 py-3 text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50"
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
