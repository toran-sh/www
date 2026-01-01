"use client";

import { useState } from "react";

interface Gateway {
  _id: string;
  subdomain: string;
  upstreamDomain: string;
  createdAt: string;
}

interface EditGatewayModalProps {
  gateway: Gateway;
  onSuccess: (gateway: Gateway) => void;
  onClose: () => void;
}

export function EditGatewayModal({
  gateway,
  onSuccess,
  onClose,
}: EditGatewayModalProps) {
  const [upstreamDomain, setUpstreamDomain] = useState(gateway.upstreamDomain);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gateways/${gateway._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upstreamDomain }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update gateway");
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <h3 className="text-lg font-semibold mb-4">Edit Gateway</h3>

        {error && (
          <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-zinc-500 mb-1">Subdomain</label>
          <code className="text-cyan-600 dark:text-cyan-400">{gateway.subdomain}</code>
          <p className="mt-1 text-xs text-zinc-500">Subdomain cannot be changed</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="editUpstreamDomain"
            className="block text-sm text-zinc-700 dark:text-zinc-300"
          >
            Upstream Domain <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="editUpstreamDomain"
            value={upstreamDomain}
            onChange={(e) => setUpstreamDomain(e.target.value)}
            placeholder="api.example.com"
            required
            className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
          />

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
