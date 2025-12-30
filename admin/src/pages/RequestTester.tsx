/**
 * Request Tester - Test routes with mutations before deploying
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import type { Gateway } from '../../../shared/src/types';

export function RequestTester() {
  const [gatewayId, setGatewayId] = useState('');
  const [routeId, setRouteId] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: gateways } = useQuery({
    queryKey: ['gateways'],
    queryFn: () => apiClient.getGateways(),
  });

  const { data: routes } = useQuery({
    queryKey: ['routes', gatewayId],
    queryFn: () => apiClient.getRoutes(gatewayId),
    enabled: !!gatewayId,
  });

  const handleTest = async () => {
    if (!routeId) {
      setError('Please select a route');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let parsedHeaders = {};
      if (headers.trim()) {
        parsedHeaders = JSON.parse(headers);
      }

      const testResult = await apiClient.testRoute(routeId, {
        method,
        path,
        headers: parsedHeaders,
        body: body || undefined,
      });

      setResult(testResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Tester</h1>
        <p className="text-gray-600 mt-1">
          Test routes with mutations before deploying
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Builder */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Request Configuration
            </h2>

            {/* Gateway Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gateway
              </label>
              <select
                value={gatewayId}
                onChange={(e) => {
                  setGatewayId(e.target.value);
                  setRouteId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gateway...</option>
                {gateways?.map((gateway) => (
                  <option key={gateway._id} value={gateway._id}>
                    {gateway.name} ({gateway.subdomain})
                  </option>
                ))}
              </select>
            </div>

            {/* Route Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                disabled={!gatewayId}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select route...</option>
                {routes?.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.name} - {route.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            {/* Path */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Path
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/users/123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Headers */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headers (JSON)
              </label>
              <textarea
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                placeholder='{"Authorization": "Bearer token"}'
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Body */}
            {method !== 'GET' && method !== 'DELETE' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"name": "John"}'
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            )}

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={loading || !routeId}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Testing...' : 'Send Test Request'}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Response Viewer */}
        <div className="space-y-4">
          {result && (
            <>
              {/* Response */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Response
                </h2>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Status
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        result.response.status < 300
                          ? 'bg-green-100 text-green-800'
                          : result.response.status < 400
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.response.status} {result.response.statusText}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Body
                    </div>
                    <pre className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs overflow-auto max-h-96">
                      {JSON.stringify(
                        JSON.parse(result.response.body || '{}'),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Execution Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Execution Details
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Pre-Mutations Applied
                    </span>
                    <span className="text-sm font-medium">
                      {result.mutationsApplied.pre}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Post-Mutations Applied
                    </span>
                    <span className="text-sm font-medium">
                      {result.mutationsApplied.post}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Time</span>
                    <span className="text-sm font-medium">
                      {result.timing.total.toFixed(2)}ms
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!result && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-500">
                Configure and send a test request to see the response here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
