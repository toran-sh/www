"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";

interface UpstreamMetrics {
  ttfb: number;
  transfer: number;
  total: number;
}

interface LogEntry {
  _id: string;
  timestamp?: string;
  request: {
    method: string;
    path: string;
    query: Record<string, string>;
  };
  response: {
    status: number;
    bodySize: number;
  };
  duration: number;
  upstreamMetrics?: UpstreamMetrics;
  cacheStatus: "HIT" | "MISS" | null;
  createdAt: string;
}

interface LogsResponse {
  logs: LogEntry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isStreaming?: boolean;
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "POST":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "PUT":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
    case "PATCH":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
    case "DELETE":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return "text-green-600 dark:text-green-400";
  } else if (status >= 400 && status < 500) {
    return "text-amber-600 dark:text-amber-400";
  } else if (status >= 500) {
    return "text-red-600 dark:text-red-400";
  }
  return "text-zinc-600 dark:text-zinc-400";
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

const POLL_INTERVAL = 2000; // 2 seconds
const MAX_LOGS = 200; // Cap logs in memory
const IDLE_TIMEOUT = 30000; // 30 seconds

export default function LogsPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<LogsResponse["pagination"]>();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isPausedByIdle, setIsPausedByIdle] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestIdRef = useRef<string | null>(null);

  // Initial fetch (full page load)
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/gateways/by-subdomain/${subdomain}/logs?page=${page}&limit=50`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch logs");
      }
      const result: LogsResponse = await res.json();
      setLogs(result.logs);
      setPagination(result.pagination);
      if (result.logs.length > 0) {
        latestIdRef.current = result.logs[0]._id;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setIsLoading(false);
    }
  }, [subdomain, page]);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setIsStreaming(false);
      setIsPausedByIdle(true);
    }, IDLE_TIMEOUT);
  }, []);

  // Streaming fetch (only new logs)
  const fetchNewLogs = useCallback(async () => {
    if (!latestIdRef.current) return;

    try {
      const res = await fetch(
        `/api/gateways/by-subdomain/${subdomain}/logs?since=${latestIdRef.current}`
      );
      if (!res.ok) return;

      const result: LogsResponse = await res.json();
      if (result.logs.length > 0) {
        // Update latest ID to the newest log
        latestIdRef.current = result.logs[0]._id;
        // Prepend new logs and cap total
        setLogs((prev) => [...result.logs, ...prev].slice(0, MAX_LOGS));
        // Reset idle timer on new activity
        resetIdleTimer();
      }
    } catch {
      // Silently fail on streaming errors
    }
  }, [subdomain, resetIdleTimer]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Polling for streaming (only on page 1)
  useEffect(() => {
    if (isStreaming && page === 1) {
      intervalRef.current = setInterval(fetchNewLogs, POLL_INTERVAL);
      // Start idle timer
      resetIdleTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
  }, [isStreaming, page, fetchNewLogs, resetIdleTimer]);

  // Handle manual toggle
  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    setIsPausedByIdle(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Logs</h1>
        <button
          onClick={toggleStreaming}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors ${
            isStreaming
              ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          {isStreaming ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Streaming
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
              {isPausedByIdle ? "Paused (idle)" : "Paused"}
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading logs...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : logs.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">TTFB</th>
                  <th className="px-4 py-3 font-medium">Transfer</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Cache</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                      {formatRelativeTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${getMethodColor(
                          log.request.method
                        )}`}
                      >
                        {log.request.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono max-w-xs truncate">
                      {log.request.path}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(log.response.status)}`}>
                      {log.response.status}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {log.upstreamMetrics ? `${log.upstreamMetrics.ttfb}ms` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {log.upstreamMetrics ? `${log.upstreamMetrics.transfer}ms` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                      {log.duration}ms
                    </td>
                    <td className="px-4 py-3">
                      {log.cacheStatus ? (
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                            log.cacheStatus === "HIT"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {log.cacheStatus}
                        </span>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {(page - 1) * pagination.limit + 1} to{" "}
                {Math.min(page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} logs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          No logs found
        </div>
      )}
    </div>
  );
}
