"use client";

import { useState } from "react";

interface Gateway {
  _id: string;
  subdomain: string;
  upstreamBaseUrl: string;
}

interface DeleteConfirmModalProps {
  gateway: Gateway;
  onSuccess: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  gateway,
  onSuccess,
  onClose,
}: DeleteConfirmModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmation === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gateways/${gateway._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete gateway");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
        <h3 className="text-lg font-semibold mb-4 text-red-600 dark:text-red-400">
          Delete Gateway
        </h3>

        {error && (
          <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          You are about to delete the gateway{" "}
          <code className="text-cyan-600 dark:text-cyan-400">{gateway.subdomain}</code>.
          This action cannot be undone.
        </p>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Type <code className="text-red-600 dark:text-red-400 font-bold">DELETE</code> to confirm:
        </p>

        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE"
          className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-red-500"
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Deleting..." : "Delete Gateway"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
