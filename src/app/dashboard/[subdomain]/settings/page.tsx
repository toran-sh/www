"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Toran {
  _id: string;
  subdomain: string;
  upstreamBaseUrl: string;
  cacheTtl: number | null;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [toran, setToran] = useState<Toran | null>(null);
  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToran() {
      try {
        const res = await fetch(`/api/torans`);
        if (!res.ok) throw new Error("Failed to fetch torans");
        const torans = await res.json();
        const found = torans.find((t: Toran) => t.subdomain === subdomain);
        if (found) {
          setToran(found);
          setUpstreamBaseUrl(found.upstreamBaseUrl);
          setCacheTtl(found.cacheTtl?.toString() ?? "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load toran");
      } finally {
        setIsLoading(false);
      }
    }

    fetchToran();
  }, [subdomain]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toran) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/torans/${toran._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upstreamBaseUrl,
          cacheTtl: cacheTtl ? parseInt(cacheTtl, 10) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update toran");
      }

      setToran(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toran || deleteConfirmation !== "DELETE") return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/torans/${toran._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete toran");
      }

      router.push("/dashboard");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-zinc-500">Loading settings...</div>
    );
  }

  if (!toran) {
    return (
      <div className="text-center py-12 text-red-500">toran not found</div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Toran Info */}
      <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
          Subdomain
        </div>
        <code className="text-cyan-600 dark:text-cyan-400 font-mono">
          {toran.subdomain}
        </code>
        <p className="mt-1 text-xs text-zinc-500">Subdomain cannot be changed</p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="mb-12">
        {error && (
          <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 border border-green-500 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400 rounded">
            Settings saved successfully
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="upstreamBaseUrl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
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
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="cacheTtl"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
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
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-cyan-600 dark:focus:border-cyan-400"
          />
          <p className="mt-2 text-xs text-zinc-500">
            How long to cache upstream responses. Leave empty to disable caching.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm font-medium text-white dark:text-zinc-950 rounded-md hover:bg-cyan-700 dark:hover:bg-cyan-400 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="border border-red-200 dark:border-red-900 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Deleting this toran is permanent and cannot be undone. All associated
          logs will remain but the toran will no longer function.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-red-700"
          >
            Delete toran
          </button>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-md">
            {deleteError && (
              <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400 rounded">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Type{" "}
              <code className="text-red-600 dark:text-red-400 font-bold">
                DELETE
              </code>{" "}
              to confirm:
            </p>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="DELETE"
              className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-red-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== "DELETE" || isDeleting}
                className="bg-red-600 px-4 py-2 text-sm font-medium text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmation("");
                  setDeleteError(null);
                }}
                className="border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
