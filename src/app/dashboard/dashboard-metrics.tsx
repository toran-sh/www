"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = "hour" | "day";

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

const METRICS_POLL_INTERVAL = 10000;

export function DashboardMetrics() {
  const [range, setRange] = useState<TimeRange>("hour");
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`/api/torans/metrics?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(fetchMetrics, METRICS_POLL_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming, fetchMetrics]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const cacheHitRate =
    metrics && metrics.summary.totalCalls > 0
      ? Math.round(
          (metrics.summary.cacheHits / metrics.summary.totalCalls) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="text-center py-8 text-zinc-500">Loading metrics...</div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Account Overview</h2>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="px-3 py-1.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last 24 Hours</option>
          </select>
          <button
            onClick={() => setIsStreaming(!isStreaming)}
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
                Live
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
                Paused
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Total Requests</div>
          <div className="text-2xl font-bold">{metrics.summary.totalCalls.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Cache Hit Rate</div>
          <div className="text-2xl font-bold">{cacheHitRate}%</div>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Cache Hits</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{metrics.summary.cacheHits.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Avg Response Time</div>
          <div className="text-2xl font-bold">{metrics.summary.avgDuration}ms</div>
        </div>
      </div>

      {/* Chart */}
      {metrics.timeSeries.length > 0 ? (
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            Requests Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "6px",
                }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
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
      ) : (
        <div className="text-center py-8 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          No data available for the selected time range
        </div>
      )}
    </div>
  );
}
