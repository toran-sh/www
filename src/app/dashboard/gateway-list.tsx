"use client";

import { useState, useEffect } from "react";
import { AddGatewayForm } from "./add-gateway-form";
import { EditGatewayModal } from "./edit-gateway-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";

interface Gateway {
  _id: string;
  subdomain: string;
  upstreamDomain: string;
  createdAt: string;
}

export function GatewayList() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [deletingGateway, setDeletingGateway] = useState<Gateway | null>(null);

  const fetchGateways = async () => {
    try {
      const response = await fetch("/api/gateways");
      if (response.ok) {
        const data = await response.json();
        setGateways(data);
      }
    } catch (error) {
      console.error("Failed to fetch gateways:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleGatewayAdded = (gateway: Gateway) => {
    setGateways([gateway, ...gateways]);
    setShowAddForm(false);
  };

  const handleGatewayUpdated = (updated: Gateway) => {
    setGateways(gateways.map((g) => (g._id === updated._id ? updated : g)));
    setEditingGateway(null);
  };

  const handleGatewayDeleted = (id: string) => {
    setGateways(gateways.filter((g) => g._id !== id));
    setDeletingGateway(null);
  };

  if (isLoading) {
    return (
      <div className="mt-6 border border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500">
        Loading gateways...
      </div>
    );
  }

  return (
    <div className="mt-6">
      {showAddForm ? (
        <AddGatewayForm
          onSuccess={handleGatewayAdded}
          onCancel={() => setShowAddForm(false)}
        />
      ) : gateways.length === 0 ? (
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
          <h3 className="font-medium">No gateways yet</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create your first gateway to start routing API requests
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-6 bg-cyan-600 dark:bg-cyan-500 px-6 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
          >
            Create Gateway
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-cyan-600 dark:bg-cyan-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-cyan-700 dark:hover:bg-cyan-400"
            >
              + Add Gateway
            </button>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left font-medium">Subdomain</th>
                  <th className="px-4 py-3 text-left font-medium">Upstream Domain</th>
                  <th className="px-4 py-3 text-left font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((gateway) => (
                  <tr
                    key={gateway._id}
                    className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <code className="text-cyan-600 dark:text-cyan-400">
                        {gateway.subdomain}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {gateway.upstreamDomain}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(gateway.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingGateway(gateway)}
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingGateway(gateway)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingGateway && (
        <EditGatewayModal
          gateway={editingGateway}
          onSuccess={handleGatewayUpdated}
          onClose={() => setEditingGateway(null)}
        />
      )}

      {deletingGateway && (
        <DeleteConfirmModal
          gateway={deletingGateway}
          onSuccess={() => handleGatewayDeleted(deletingGateway._id)}
          onClose={() => setDeletingGateway(null)}
        />
      )}
    </div>
  );
}
