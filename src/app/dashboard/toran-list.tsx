"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AddToranForm } from "./add-toran-form";

interface Toran {
  _id: string;
  subdomain: string;
  upstreamBaseUrl: string;
  createdAt: string;
}

export function ToranList() {
  const [torans, setTorans] = useState<Toran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchTorans = async () => {
    try {
      const response = await fetch("/api/torans");
      if (response.ok) {
        const data = await response.json();
        setTorans(data);
      }
    } catch (error) {
      console.error("Failed to fetch torans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTorans();
  }, []);

  const handleToranAdded = (toran: Toran) => {
    setTorans([toran, ...torans]);
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500">
        Loading torans...
      </div>
    );
  }

  return (
    <div className="mt-6">
      {showAddForm ? (
        <AddToranForm
          onSuccess={handleToranAdded}
          onCancel={() => setShowAddForm(false)}
        />
      ) : torans.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="font-medium">No torans yet</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create your first toran to start routing API requests
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 bg-cyan-600 dark:bg-cyan-500 px-6 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Create toran
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
            >
              + Add toran
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left font-medium">Subdomain</th>
                  <th className="px-4 py-3 text-left font-medium">Upstream Base URL</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {torans.map((toran) => (
                  <tr
                    key={toran._id}
                    className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/toran/${toran.subdomain}`}
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline font-mono"
                      >
                        {toran.subdomain}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {toran.upstreamBaseUrl}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(toran.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
