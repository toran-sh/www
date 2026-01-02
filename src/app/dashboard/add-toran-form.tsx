"use client";

import { useState } from "react";

interface Toran {
  _id: string;
  subdomain: string;
  upstreamBaseUrl: string;
  cacheTtl: number | null;
  createdAt: string;
}

interface AddToranFormProps {
  onSuccess: (toran: Toran) => void;
  onCancel: () => void;
}

export function AddToranForm({ onSuccess, onCancel }: AddToranFormProps) {
  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/torans", {
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

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-semibold mb-4">Create new toran</h3>

      {error && (
        <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="upstreamBaseUrl"
          className="block text-sm text-zinc-700 dark:text-zinc-300"
        >
          Upstream Base URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="upstreamBaseUrl"
          value={upstreamBaseUrl}
          onChange={(e) => setUpstreamBaseUrl(e.target.value)}
          placeholder="https://api.example.com"
          required
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
        />
        <p className="mt-2 text-xs text-zinc-500">
          The base URL where requests will be proxied to. A random subdomain will be generated automatically.
        </p>

        <label
          htmlFor="cacheTtl"
          className="block text-sm text-zinc-700 dark:text-zinc-300 mt-4"
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
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
        />
        <p className="mt-2 text-xs text-zinc-500">
          How long to cache upstream responses. Leave empty to disable caching.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create toran"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
