"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

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
  cacheStatus: "HIT" | "MISS" | null;
  createdAt: string;
}

interface LogsData {
  logs: LogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export default function LogsPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [data, setData] = useState<LogsData | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/gateways/by-subdomain/${subdomain}/logs?page=${page}&limit=50`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch logs");
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch logs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [subdomain, page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Logs</h1>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading logs...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : data && data.logs.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Cache</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {data.logs.map((log) => (
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
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing {(page - 1) * data.pagination.limit + 1} to{" "}
                {Math.min(page * data.pagination.limit, data.pagination.total)}{" "}
                of {data.pagination.total} logs
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
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page >= data.pagination.totalPages}
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
