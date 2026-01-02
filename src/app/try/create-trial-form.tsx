"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateTrialForm() {
  const router = useRouter();
  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/trial/torans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upstreamBaseUrl,
          cacheTtl: cacheTtl ? parseInt(cacheTtl, 10) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create toran");
      }

      // Redirect to trial logs page
      router.push(`/try/${data.subdomain}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
      {error && (
        <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="upstreamBaseUrl"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Upstream Base URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="upstreamBaseUrl"
          value={upstreamBaseUrl}
          onChange={(e) => setUpstreamBaseUrl(e.target.value)}
          placeholder="https://api.example.com"
          required
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600/20"
        />
        <p className="mt-2 text-xs text-zinc-500">
          The API endpoint to proxy requests to.
        </p>

        <label
          htmlFor="cacheTtl"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-4"
        >
          Cache TTL (seconds)
        </label>
        <input
          type="number"
          id="cacheTtl"
          value={cacheTtl}
          onChange={(e) => setCacheTtl(e.target.value)}
          placeholder="e.g. 300"
          min="0"
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400 focus:ring-2 focus:ring-cyan-600/20"
        />
        <p className="mt-2 text-xs text-zinc-500">
          Optional. Cache responses for this many seconds.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full bg-cyan-600 dark:bg-cyan-500 px-4 py-3 text-sm font-medium text-white dark:text-zinc-950 rounded-md hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Creating..." : "Create toran"}
        </button>
      </form>
    </div>
  );
}
