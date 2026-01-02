"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ClaimForm } from "./claim-form";
import { EditToranCard } from "./edit-toran-card";

type MethodFilter = "ALL" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type CacheFilter = "ALL" | "HIT" | "MISS";

interface MetricsData {
  summary: {
    totalCalls: number;
    cacheHits: number;
    cacheMisses: number;
    avgDuration: number;
  };
  timeSeries: {
    timestamp: string;
    calls: number;
    cacheHits: number;
    cacheMisses: number;
    avgDuration: number;
  }[];
}

interface Filters {
  slow: boolean;
  errors: boolean;
  method: MethodFilter;
  cache: CacheFilter;
}

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

const POLL_INTERVAL = 2000;
const MAX_LOGS = 200;
const IDLE_TIMEOUT = 30000;

interface TrialLogsViewProps {
  subdomain: string;
}

export function TrialLogsView({ subdomain }: TrialLogsViewProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<LogsResponse["pagination"]>();
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isPausedByIdle, setIsPausedByIdle] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    slow: false,
    errors: false,
    method: "ALL",
    cache: "ALL",
  });
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestIdRef = useRef<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filters.slow && log.duration <= 100) return false;
      if (filters.errors && log.response.status >= 200 && log.response.status < 300) return false;
      if (filters.method !== "ALL" && log.request.method.toUpperCase() !== filters.method) return false;
      if (filters.cache !== "ALL") {
        if (filters.cache === "HIT" && log.cacheStatus !== "HIT") return false;
        if (filters.cache === "MISS" && log.cacheStatus !== "MISS") return false;
      }
      return true;
    });
  }, [logs, filters]);

  const hasActiveFilters = filters.slow || filters.errors || filters.method !== "ALL" || filters.cache !== "ALL";

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/trial/${subdomain}/logs?page=${page}&limit=50`
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

  const resetIdleTimer = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setIsStreaming(false);
      setIsPausedByIdle(true);
    }, IDLE_TIMEOUT);
  }, []);

  const fetchNewLogs = useCallback(async () => {
    if (!latestIdRef.current) return;

    try {
      const res = await fetch(
        `/api/trial/${subdomain}/logs?since=${latestIdRef.current}`
      );
      if (!res.ok) return;

      const result: LogsResponse = await res.json();
      if (result.logs.length > 0) {
        latestIdRef.current = result.logs[0]._id;
        setLogs((prev) => [...result.logs, ...prev].slice(0, MAX_LOGS));
        resetIdleTimer();
      }
    } catch {
      // Silently fail on streaming errors
    }
  }, [subdomain, resetIdleTimer]);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`/api/trial/${subdomain}/metrics?range=hour`);
      if (!res.ok) return;
      const data = await res.json();
      setMetrics(data);
    } catch {
      // Silently fail on metrics errors
    }
  }, [subdomain]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    fetchLogs();
    fetchMetrics();
  }, [fetchLogs, fetchMetrics]);

  useEffect(() => {
    if (isStreaming && page === 1) {
      // Fetch immediately when streaming starts/resumes
      fetchNewLogs();
      fetchMetrics();
      intervalRef.current = setInterval(fetchNewLogs, POLL_INTERVAL);
      metricsIntervalRef.current = setInterval(fetchMetrics, 10000); // Refresh metrics every 10s
      resetIdleTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
        metricsIntervalRef.current = null;
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
  }, [isStreaming, page, fetchNewLogs, fetchMetrics, resetIdleTimer]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    setIsPausedByIdle(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-cyan-600 dark:text-cyan-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Create another
          </Link>
        </nav>
      </header>

      {/* Trial Banner */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <span className="font-medium">Trial toran</span>
            <span className="mx-2 opacity-50">|</span>
            <code className="text-cyan-100">{subdomain}</code>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Logs */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
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

            {/* Metrics Chart */}
            {metrics && metrics.timeSeries.length > 0 && (
              <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Requests Over Time (Last Hour)
                  </h3>
                  <div className="flex gap-4 text-xs text-zinc-500">
                    <span>{metrics.summary.totalCalls} requests</span>
                    <span>{metrics.summary.avgDuration}ms avg</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={metrics.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTime}
                      stroke="#6b7280"
                      fontSize={11}
                    />
                    <YAxis stroke="#6b7280" fontSize={11} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #3f3f46",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                      name="Requests"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Logs Header */}
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Logs</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-1">Filters:</span>

              <button
                onClick={() => setFilters((f) => ({ ...f, slow: !f.slow }))}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.slow
                    ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Slow (&gt;100ms)
              </button>

              <button
                onClick={() => setFilters((f) => ({ ...f, errors: !f.errors }))}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  filters.errors
                    ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Errors
              </button>

              <select
                value={filters.method}
                onChange={(e) => setFilters((f) => ({ ...f, method: e.target.value as MethodFilter }))}
                className={`px-3 py-1 text-xs rounded-full border transition-colors outline-none ${
                  filters.method !== "ALL"
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <option value="ALL">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <select
                value={filters.cache}
                onChange={(e) => setFilters((f) => ({ ...f, cache: e.target.value as CacheFilter }))}
                className={`px-3 py-1 text-xs rounded-full border transition-colors outline-none ${
                  filters.cache !== "ALL"
                    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <option value="ALL">All Cache</option>
                <option value="HIT">Cache HIT</option>
                <option value="MISS">Cache MISS</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ slow: false, errors: false, method: "ALL", cache: "ALL" })}
                  className="px-3 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  Clear all
                </button>
              )}

              {hasActiveFilters && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-auto">
                  {filteredLogs.length} of {logs.length} logs
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-zinc-500">Loading logs...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : logs.length > 0 ? (
              <>
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
                    No logs match the current filters
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
                      <table className="w-full">
                        <thead className="bg-zinc-50 dark:bg-zinc-800">
                          <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400">
                            <th className="px-4 py-3 font-medium">Time</th>
                            <th className="px-4 py-3 font-medium">Method</th>
                            <th className="px-4 py-3 font-medium">Path</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">TTFB</th>
                            <th className="px-4 py-3 font-medium">Total</th>
                            <th className="px-4 py-3 font-medium">Cache</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {filteredLogs.map((log) => (
                            <tr
                              key={log._id}
                              className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                              <td className="px-4 py-3 text-sm font-mono max-w-xs truncate text-zinc-900 dark:text-zinc-100">
                                {log.request.path}
                              </td>
                              <td className={`px-4 py-3 text-sm font-medium ${getStatusColor(log.response.status)}`}>
                                {log.response.status}
                              </td>
                              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                {log.upstreamMetrics ? `${log.upstreamMetrics.ttfb}ms` : "-"}
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
                )}
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900">
                <p className="mb-2">No logs yet</p>
                <p className="text-sm">
                  Make a request to your toran endpoint to see logs here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Claim Form */}
          <div className="lg:col-span-1">
            <ClaimForm subdomain={subdomain} />

            {/* Endpoint Info */}
            <div className="mt-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">
                Your toran endpoint
              </h3>
              <code className="block p-3 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-cyan-600 dark:text-cyan-400 break-all">
                https://{subdomain}.toran.sh
              </code>
              <p className="mt-3 text-xs text-zinc-500">
                Send requests to this URL to proxy them through your toran.
              </p>
            </div>

            {/* Edit Toran Card */}
            <div className="mt-6">
              <EditToranCard subdomain={subdomain} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto mt-16 border-t border-zinc-200 dark:border-zinc-800 px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-sm text-zinc-500">
              Live outbound API inspector — see, search, and understand calls
              without SDKs.
            </div>
            <div className="flex gap-4 text-sm text-zinc-500">
              <Link
                href="/pricing"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Pricing
              </Link>
              <Link
                href="/roadmap"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Roadmap
              </Link>
              <a
                href="/privacy"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
