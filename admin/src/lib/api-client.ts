/**
 * API Client for toran.dev admin UI
 *
 * Communicates with Cloudflare Pages Functions (admin/functions/api/...)
 */

import type {
  Gateway,
  Route,
  Log,
  CreateGatewayRequest,
  UpdateGatewayRequest,
  CreateRouteRequest,
  UpdateRouteRequest,
  LogFilters
} from '../../../shared/src/types';

const API_BASE = '/api';

class ApiClient {
  // ============================================================================
  // Gateway Operations
  // ============================================================================

  async getGateways(): Promise<Gateway[]> {
    const response = await fetch(`${API_BASE}/gateways`);
    if (!response.ok) {
      throw new Error('Failed to fetch gateways');
    }
    return response.json();
  }

  async getGateway(id: string): Promise<Gateway> {
    const response = await fetch(`${API_BASE}/gateways/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch gateway');
    }
    return response.json();
  }

  async createGateway(data: CreateGatewayRequest): Promise<Gateway> {
    const response = await fetch(`${API_BASE}/gateways`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create gateway');
    }
    return response.json();
  }

  async updateGateway(data: UpdateGatewayRequest): Promise<Gateway> {
    const response = await fetch(`${API_BASE}/gateways/${data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update gateway');
    }
    return response.json();
  }

  async deleteGateway(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/gateways/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete gateway');
    }
  }

  // ============================================================================
  // Route Operations
  // ============================================================================

  async getRoutes(gatewayId: string): Promise<Route[]> {
    const response = await fetch(`${API_BASE}/routes?gatewayId=${gatewayId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch routes');
    }
    return response.json();
  }

  async getRoute(id: string): Promise<Route> {
    const response = await fetch(`${API_BASE}/routes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch route');
    }
    return response.json();
  }

  async createRoute(data: CreateRouteRequest): Promise<Route> {
    const response = await fetch(`${API_BASE}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create route');
    }
    return response.json();
  }

  async updateRoute(data: UpdateRouteRequest): Promise<Route> {
    const response = await fetch(`${API_BASE}/routes/${data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update route');
    }
    return response.json();
  }

  async deleteRoute(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/routes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete route');
    }
  }

  // ============================================================================
  // Log Operations
  // ============================================================================

  async getLogs(filters: LogFilters = {}): Promise<Log[]> {
    const params = new URLSearchParams();

    if (filters.gatewayId) params.set('gatewayId', filters.gatewayId);
    if (filters.subdomain) params.set('subdomain', filters.subdomain);
    if (filters.startDate) params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params.set('endDate', filters.endDate.toISOString());
    if (filters.statusCode) params.set('statusCode', filters.statusCode.toString());
    if (filters.method) params.set('method', filters.method);
    if (filters.search) params.set('search', filters.search);
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const response = await fetch(`${API_BASE}/logs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }
    return response.json();
  }

  async getLog(id: string): Promise<Log> {
    const response = await fetch(`${API_BASE}/logs/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch log');
    }
    return response.json();
  }

  // ============================================================================
  // Cache Operations
  // ============================================================================

  async invalidateRouteCache(routeId: string): Promise<{ deleted: number }> {
    const response = await fetch(`${API_BASE}/cache/invalidate/route/${routeId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to invalidate cache');
    }
    return response.json();
  }

  async invalidateGatewayCache(gatewayId: string): Promise<{ deleted: number }> {
    const response = await fetch(`${API_BASE}/cache/invalidate/gateway/${gatewayId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to invalidate cache');
    }
    return response.json();
  }

  // ============================================================================
  // Test Operations
  // ============================================================================

  async testRoute(routeId: string, request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<{
    response: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
    };
    mutationsApplied: {
      pre: number;
      post: number;
    };
    timing: {
      total: number;
      breakdown: {
        routing: number;
        preMutations: number;
        proxy: number;
        postMutations: number;
      };
    };
  }> {
    const response = await fetch(`${API_BASE}/test/route/${routeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Failed to test route');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();
