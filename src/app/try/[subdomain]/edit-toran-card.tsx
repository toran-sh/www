"use client";

import { useState, useEffect } from "react";

interface LogFilter {
  field: string;
  location: "header" | "query" | "body";
  action: "redact";
}

interface LogFilters {
  request: LogFilter[];
  response: LogFilter[];
}

interface ToranData {
  upstreamBaseUrl: string;
  cacheTtl: number | null;
  logFilters?: LogFilters;
}

const DEFAULT_LOG_FILTERS: LogFilters = {
  request: [
    { field: "authorization", location: "header", action: "redact" },
    { field: "x-api-key", location: "header", action: "redact" },
    { field: "api-key", location: "header", action: "redact" },
    { field: "x-auth-token", location: "header", action: "redact" },
    { field: "cookie", location: "header", action: "redact" },
    { field: "key", location: "header", action: "redact" },
    { field: "api_key", location: "header", action: "redact" },
    { field: "apikey", location: "header", action: "redact" },
    { field: "token", location: "header", action: "redact" },
    { field: "access_token", location: "header", action: "redact" },
    { field: "id_token", location: "header", action: "redact" },
    { field: "refresh_token", location: "header", action: "redact" },
    { field: "secret", location: "header", action: "redact" },
    { field: "client_secret", location: "header", action: "redact" },
    { field: "signature", location: "header", action: "redact" },
    { field: "sig", location: "header", action: "redact" },
    { field: "password", location: "header", action: "redact" },
    { field: "passwd", location: "header", action: "redact" },
    { field: "auth", location: "header", action: "redact" },
    { field: "session", location: "header", action: "redact" },
    { field: "code", location: "header", action: "redact" },
  ],
  response: [{ field: "set-cookie", location: "header", action: "redact" }],
};

interface EditToranCardProps {
  subdomain: string;
}

export function EditToranCard({ subdomain }: EditToranCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [logFilters, setLogFilters] = useState<LogFilters>(DEFAULT_LOG_FILTERS);

  // New filter form state
  const [newFilterType, setNewFilterType] = useState<"request" | "response">(
    "request"
  );
  const [newFilterField, setNewFilterField] = useState("");
  const [newFilterLocation, setNewFilterLocation] = useState<
    "header" | "query" | "body"
  >("header");

  useEffect(() => {
    async function fetchToran() {
      try {
        const res = await fetch(`/api/trial/${subdomain}`);
        if (!res.ok) throw new Error("Failed to fetch toran");
        const data: ToranData = await res.json();
        setUpstreamBaseUrl(data.upstreamBaseUrl);
        setCacheTtl(data.cacheTtl?.toString() ?? "");
        setLogFilters(data.logFilters ?? DEFAULT_LOG_FILTERS);
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
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/trial/${subdomain}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cacheTtl: cacheTtl ? parseInt(cacheTtl, 10) : null,
          logFilters,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update toran");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
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

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="text-sm text-zinc-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-4">
        Edit toran
      </h3>

      <form onSubmit={handleSave}>
        {error && (
          <div className="mb-3 p-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 p-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
            Settings saved. Changes may take up to 60 seconds to propagate to
            all edge nodes.
          </div>
        )}

        {/* Upstream URL (readonly) */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Upstream Base URL
          </label>
          <div className="w-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded text-sm text-zinc-600 dark:text-zinc-400 break-all">
            {upstreamBaseUrl}
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Cannot be changed after creation.
          </p>
        </div>

        {/* Cache TTL */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
            Cache TTL (seconds)
          </label>
          <input
            type="number"
            value={cacheTtl}
            onChange={(e) => setCacheTtl(e.target.value)}
            placeholder="e.g. 300"
            min="0"
            className="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 rounded text-sm text-zinc-900 dark:text-white placeholder-zinc-400"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Leave empty to disable caching.
          </p>
        </div>

        {/* Log Filters */}
        <div className="mb-4 border border-zinc-200 dark:border-zinc-700 rounded p-3">
          <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Log Filters
          </h4>
          <p className="text-xs text-zinc-500 mb-3">
            Mask or exclude sensitive fields from logs.
          </p>

          {/* Request Filters */}
          <div className="mb-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
              Request
            </div>
            {logFilters.request.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No filters</p>
            ) : (
              <div className="space-y-1">
                {logFilters.request.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded"
                  >
                    <code className="text-sky-600 dark:text-sky-400">
                      {filter.field}
                    </code>
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
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Response Filters */}
          <div className="mb-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
              Response
            </div>
            {logFilters.response.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No filters</p>
            ) : (
              <div className="space-y-1">
                {logFilters.response.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded"
                  >
                    <code className="text-sky-600 dark:text-sky-400">
                      {filter.field}
                    </code>
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
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Filter */}
          <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
            <div className="grid grid-cols-2 gap-1 mb-1">
              <select
                value={newFilterType}
                onChange={(e) =>
                  setNewFilterType(e.target.value as "request" | "response")
                }
                className="border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded text-xs"
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
                className="border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded text-xs"
              >
                <option value="header">Header</option>
                <option value="query">Query</option>
                <option value="body">Body</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-1">
              <input
                type="text"
                value={newFilterField}
                onChange={(e) => setNewFilterField(e.target.value)}
                placeholder="Field name"
                className="border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded text-xs placeholder-zinc-400"
              />
            </div>
            <button
              type="button"
              onClick={addFilter}
              disabled={!newFilterField.trim()}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50"
            >
              + Add filter
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-sky-600 dark:bg-sky-500 px-3 py-2 text-sm font-medium text-white dark:text-zinc-950 rounded hover:bg-sky-700 dark:hover:bg-sky-400 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <p className="mt-2 text-xs text-zinc-500 text-center">
          Changes may take up to 60 seconds to propagate.
        </p>
      </form>
    </div>
  );
}
