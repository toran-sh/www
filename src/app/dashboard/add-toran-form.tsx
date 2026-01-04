"use client";

import { useState } from "react";
import { Turnstile } from "@/components/turnstile";
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
  createdAt: string;
}

interface AddToranFormProps {
  onSuccess: (toran: Toran) => void;
  onCancel: () => void;
}

export function AddToranForm({ onSuccess, onCancel }: AddToranFormProps) {
  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState("");
  const [cacheTtl, setCacheTtl] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [logFilters, setLogFilters] = useState<LogFilters>(DEFAULT_LOG_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // New filter form state
  const [newFilterType, setNewFilterType] = useState<"request" | "response">(
    "request"
  );
  const [newFilterField, setNewFilterField] = useState("");
  const [newFilterLocation, setNewFilterLocation] = useState<
    "header" | "query" | "body"
  >("header");

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
          logFilters,
          turnstileToken,
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
          className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-sky-600 dark:focus:border-sky-400"
        />
        <p className="mt-2 text-xs text-zinc-500">
          The base URL where requests will be proxied to. A random subdomain will be generated automatically.
        </p>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-sm text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          {showAdvanced ? "▼" : "▶"} Advanced options
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            {/* Cache TTL */}
            <div>
              <label
                htmlFor="cacheTtl"
                className="block text-sm text-zinc-700 dark:text-zinc-300"
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
                className="mt-2 w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-sky-600 dark:focus:border-sky-400"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Optional. Cache responses for this many seconds.
              </p>
            </div>

            {/* Log Filters */}
            <div className="border border-zinc-200 dark:border-zinc-700 rounded p-3">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Log Filters
              </h4>
              <p className="text-xs text-zinc-500 mb-3">
                Redact sensitive fields from logs.
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
                        <span className="text-yellow-600 dark:text-yellow-400">
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
                        <span className="text-yellow-600 dark:text-yellow-400">
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
                <div className="mb-1">
                  <input
                    type="text"
                    value={newFilterField}
                    onChange={(e) => setNewFilterField(e.target.value)}
                    placeholder="Field name"
                    className="w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded text-xs placeholder-zinc-400"
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
          </div>
        )}

        <Turnstile onVerify={setTurnstileToken} />
        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="bg-sky-600 dark:bg-sky-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400 disabled:opacity-50"
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
