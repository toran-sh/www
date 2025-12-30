/**
 * Gateway List Page - View and manage all gateways
 */

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Settings, Trash2, Power } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import type { Gateway } from '../../../shared/src/types';

export function GatewayList() {
  const { data: gateways, isLoading, error } = useQuery({
    queryKey: ['gateways'],
    queryFn: () => apiClient.getGateways(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading gateways...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error loading gateways: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gateways</h1>
          <p className="text-gray-600 mt-1">
            Manage your API gateways and subdomains
          </p>
        </div>
        <Link
          to="/gateways/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Gateway
        </Link>
      </div>

      {/* Gateway List */}
      {gateways && gateways.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No gateways yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first gateway to get started
          </p>
          <Link
            to="/gateways/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Gateway
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways?.map((gateway) => (
            <GatewayCard key={gateway._id} gateway={gateway} />
          ))}
        </div>
      )}
    </div>
  );
}

function GatewayCard({ gateway }: { gateway: Gateway }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {gateway.name}
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                gateway.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <Power className="w-3 h-3 mr-1" />
              {gateway.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <code className="text-sm text-blue-600 font-mono">
            {gateway.subdomain}.toran.dev
          </code>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {gateway.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
        <div>
          <div className="text-xs text-gray-500 uppercase">Routes</div>
          <div className="text-lg font-semibold text-gray-900">
            {gateway.stats.totalRoutes}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase">Requests</div>
          <div className="text-lg font-semibold text-gray-900">
            {gateway.stats.totalRequests.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/gateways/${gateway._id}`}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage
        </Link>
        <Link
          to={`/gateways/${gateway._id}/routes`}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          Routes
        </Link>
      </div>
    </div>
  );
}
