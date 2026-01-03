"use client";

import { useState } from "react";

interface ClaimFormProps {
  subdomain: string;
}

export function ClaimForm({ subdomain }: ClaimFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trial/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subdomain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send claim link");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-medium text-green-800 dark:text-green-200">
            Check your email
          </h3>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300">
          We sent a link to <strong>{email}</strong>. Click it to claim this
          toran and create your account.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
          className="mt-4 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        Claim this toran
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Enter your email to save this toran to your account. We'll send you a
        magic link to claim it.
      </p>

      {error && (
        <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
        >
          Email address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-sky-600 dark:focus:border-sky-400 focus:ring-2 focus:ring-sky-600/20"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-sky-600 dark:bg-sky-500 px-4 py-3 text-sm font-medium text-white dark:text-zinc-950 rounded-md hover:bg-sky-700 dark:hover:bg-sky-400 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Sending..." : "Send claim link"}
        </button>
      </form>
    </div>
  );
}
