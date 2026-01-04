"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DEFAULT_LOG_FILTERS,
  type LogFilter,
  type LogFilters,
} from "@/lib/log-filters";

interface Toran {
  _id: string;
  subdomain: string;
  upstreamBaseUrl: string;
  cacheTtl: number | null;
  logFilters?: LogFilters;
  logResponseBody?: boolean;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [toran, setToran] = useState<Toran | null>(null);
  const [cacheTtl, setCacheTtl] = useState("");
  const [logFilters, setLogFilters] = useState<LogFilters>(DEFAULT_LOG_FILTERS);
  const [logResponseBody, setLogResponseBody] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // New filter form state
  const [newFilterType, setNewFilterType] = useState<"request" | "response">(
    "request"
  );
  const [newFilterField, setNewFilterField] = useState("");
  const [newFilterLocation, setNewFilterLocation] = useState<
    "header" | "query" | "body"
  >("header");

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
          setCacheTtl(found.cacheTtl?.toString() ?? "");
          setLogFilters(found.logFilters ?? DEFAULT_LOG_FILTERS);
          setLogResponseBody(found.logResponseBody ?? false);
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
          cacheTtl: cacheTtl ? parseInt(cacheTtl, 10) : null,
          logFilters,
          logResponseBody,
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

  const addFilter = () => {
    if (!newFilterField.trim()) return;

    const newFilter: LogFilter = {
      field: newFilterField.trim().toLowerCase(),
      location: newFilterLocation,
      action: "redact",
    };

    setLogFilters((prev) => ({
      ...prev,
      [newFilterType]: [...prev[newFilterType], newFilter],
    }));

    setNewFilterField("");
  };

  const removeFilter = (type: "request" | "response", index: number) => {
    setLogFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
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
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong"
      );
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Subdomain
            </div>
            <code className="text-sky-600 dark:text-sky-400 font-mono">
              {toran.subdomain}
            </code>
          </div>
          <div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              Upstream Base URL
            </div>
            <code className="text-sky-600 dark:text-sky-400 font-mono text-sm break-all">
              {toran.upstreamBaseUrl}
            </code>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Subdomain and upstream URL cannot be changed after creation.
        </p>
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
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-sky-600 dark:focus:border-sky-400"
          />
          <p className="mt-2 text-xs text-zinc-500">
            How long to cache upstream responses. Leave empty to disable
            caching.
          </p>
        </div>

        {/* Log Response Body Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={logResponseBody}
              onChange={(e) => setLogResponseBody(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Log response bodies
            </span>
          </label>
          <p className="mt-2 text-xs text-zinc-500 ml-7">
            When enabled, response bodies are captured in logs. Binary responses
            are base64-encoded. May increase storage usage significantly.
          </p>
        </div>

        {/* Log Filters Section */}
        <div className="mb-6 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            Log Filters
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Control what data is logged. Masked values show first 4 characters.
            Excluded fields are not logged at all.
          </p>

          {/* Request Filters */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Request Filters
            </h4>
            {logFilters.request.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No request filters</p>
            ) : (
              <div className="space-y-2">
                {logFilters.request.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded"
                  >
                    <code className="text-sky-600 dark:text-sky-400">
                      {filter.field}
                    </code>
                    <span className="text-zinc-400">in</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {filter.location}
                    </span>
                    <span className="text-zinc-400">→</span>
                    <span
                      className={
                        filter.action === "redact"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      redact
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFilter("request", index)}
                      className="ml-auto text-zinc-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Filters */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase tracking-wide">
              Response Filters
            </h4>
            {logFilters.response.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                No response filters
              </p>
            ) : (
              <div className="space-y-2">
                {logFilters.response.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded"
                  >
                    <code className="text-sky-600 dark:text-sky-400">
                      {filter.field}
                    </code>
                    <span className="text-zinc-400">in</span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {filter.location}
                    </span>
                    <span className="text-zinc-400">→</span>
                    <span
                      className={
                        filter.action === "redact"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      redact
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFilter("response", index)}
                      className="ml-auto text-zinc-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Filter */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 mt-4">
            <h4 className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-3">
              Add Filter
            </h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={newFilterType}
                onChange={(e) =>
                  setNewFilterType(e.target.value as "request" | "response")
                }
                className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 rounded text-sm text-zinc-900 dark:text-white"
              >
                <option value="request">Request</option>
                <option value="response">Response</option>
              </select>
              <select
                value={newFilterLocation}
                onChange={(e) =>
                  setNewFilterLocation(
                    e.target.value as "header" | "query" | "body"
                  )
                }
                className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 rounded text-sm text-zinc-900 dark:text-white"
              >
                <option value="header">Header</option>
                <option value="query">Query Param</option>
                <option value="body">Body Field</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={newFilterField}
                onChange={(e) => setNewFilterField(e.target.value)}
                placeholder="Field name (e.g. authorization)"
                className="border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 rounded text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
              />
            </div>
            <button
              type="button"
              onClick={addFilter}
              disabled={!newFilterField.trim()}
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              + Add filter
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-sky-600 dark:bg-sky-500 px-4 py-2 text-sm font-medium text-white dark:text-zinc-950 rounded-md hover:bg-sky-700 dark:hover:bg-sky-400 disabled:opacity-50"
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
