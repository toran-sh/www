"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

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

type TimeRange = "hour" | "day";

export default function GatewayDashboardPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const [range, setRange] = useState<TimeRange>("hour");
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/gateways/by-subdomain/${subdomain}/metrics?range=${range}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch metrics");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [subdomain, range]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (range === "hour") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const cacheHitRate =
    metrics && metrics.summary.totalCalls > 0
      ? Math.round(
          (metrics.summary.cacheHits / metrics.summary.totalCalls) * 100
        )
      : 0;

  return (
    <div>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as TimeRange)}
          className="px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="hour">Last Hour</option>
          <option value="day">Last 24 Hours</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading metrics...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : metrics ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Total Requests
              </div>
              <div className="text-2xl font-bold mt-1">
                {metrics.summary.totalCalls.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Cache Hit Rate
              </div>
              <div className="text-2xl font-bold mt-1">
                {cacheHitRate}%
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Cache Hits
              </div>
              <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                {metrics.summary.cacheHits.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Avg Response Time
              </div>
              <div className="text-2xl font-bold mt-1">
                {metrics.summary.avgDuration}ms
              </div>
            </div>
          </div>

          {/* Charts */}
          {metrics.timeSeries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Requests Over Time */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                  Requests Over Time
                </h3>
                <ResponsiveContainer width="100%" height={250}>
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

              {/* Cache Hit/Miss */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
                  Cache Performance
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.timeSeries}>
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
                      labelFormatter={(label) =>
                        new Date(label).toLocaleString()
                      }
                    />
                    <Legend />
                    <Bar dataKey="cacheHits" fill="#22c55e" name="Cache Hits" stackId="cache" />
                    <Bar dataKey="cacheMisses" fill="#6b7280" name="Cache Misses" stackId="cache" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              No data available for the selected time range
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
