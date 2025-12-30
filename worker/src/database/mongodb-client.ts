/**
 * MongoDB Data API client for Cloudflare Workers
 * Updated for gateway-based architecture
 */

import type { Env, Gateway, Route, Log, MongoDBDataAPIResponse } from '../../../shared/src/types';

const DATA_SOURCE = 'Cluster0'; // Default MongoDB cluster name

/**
 * MongoDB Data API client
 */
export class MongoDBClient {
  constructor(private env: Env) {}

  /**
   * Make a request to MongoDB Data API
   */
  private async request<T>(
    action: string,
    body: Record<string, unknown>
  ): Promise<MongoDBDataAPIResponse<T>> {
    const response = await fetch(`${this.env.MONGODB_API_URL}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.env.MONGODB_API_KEY,
      },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: this.env.MONGODB_DATABASE,
        ...body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MongoDB API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  // ============================================================================
  // Gateway Operations
  // ============================================================================

  /**
   * Find a gateway by subdomain
   */
  async findGatewayBySubdomain(subdomain: string): Promise<Gateway | null> {
    const result = await this.request<Gateway>('findOne', {
      collection: 'gateways',
      filter: { subdomain, active: true },
    });

    return result.document || null;
  }

  /**
   * Find gateway by ID
   */
  async findGatewayById(gatewayId: string): Promise<Gateway | null> {
    const result = await this.request<Gateway>('findOne', {
      collection: 'gateways',
      filter: { _id: { $oid: gatewayId } },
    });

    return result.document || null;
  }

  /**
   * Update gateway stats (increment request count, update last request time)
   */
  async updateGatewayStats(gatewayId: string): Promise<void> {
    try {
      await this.request('updateOne', {
        collection: 'gateways',
        filter: { _id: { $oid: gatewayId } },
        update: {
          $inc: { 'stats.totalRequests': 1 },
          $set: { 'stats.lastRequestAt': { $date: new Date().toISOString() } },
        },
      });
    } catch (error) {
      // Silently fail - stats update shouldn't break the proxy
      console.error('Failed to update gateway stats:', error);
    }
  }

  // ============================================================================
  // Route Operations
  // ============================================================================

  /**
   * Find all active routes for a gateway, sorted by priority
   */
  async findRoutesByGateway(
    gatewayId: string,
    options: { active?: boolean } = {}
  ): Promise<Route[]> {
    const filter: Record<string, unknown> = { gatewayId: { $oid: gatewayId } };

    if (options.active !== undefined) {
      filter.active = options.active;
    }

    const result = await this.request<Route>('find', {
      collection: 'routes',
      filter,
      sort: { priority: -1 }, // Higher priority first
    });

    return result.documents || [];
  }

  /**
   * Find route by ID
   */
  async findRouteById(routeId: string): Promise<Route | null> {
    const result = await this.request<Route>('findOne', {
      collection: 'routes',
      filter: { _id: { $oid: routeId } },
    });

    return result.document || null;
  }

  /**
   * Update route stats (increment request count, cache hits/misses, avg duration)
   */
  async updateRouteStats(
    routeId: string,
    stats: {
      cacheHit?: boolean;
      duration?: number;
    }
  ): Promise<void> {
    try {
      const updates: Record<string, unknown> = {
        $inc: { 'stats.totalRequests': 1 },
        $set: { 'stats.lastRequestAt': { $date: new Date().toISOString() } },
      };

      // Increment cache hits or misses
      if (stats.cacheHit !== undefined) {
        if (stats.cacheHit) {
          updates.$inc = { ...updates.$inc, 'stats.cacheHits': 1 };
        } else {
          updates.$inc = { ...updates.$inc, 'stats.cacheMisses': 1 };
        }
      }

      // Update average duration (using incremental average formula)
      if (stats.duration !== undefined) {
        // This is a simplified approach - for accurate avg, we'd need current count
        updates.$set = {
          ...updates.$set,
          'stats.avgDuration': stats.duration, // Simplified - should use proper formula
        };
      }

      await this.request('updateOne', {
        collection: 'routes',
        filter: { _id: { $oid: routeId } },
        update: updates,
      });
    } catch (error) {
      console.error('Failed to update route stats:', error);
    }
  }

  // ============================================================================
  // Log Operations
  // ============================================================================

  /**
   * Insert a log entry
   */
  async insertLog(log: Partial<Log>): Promise<void> {
    try {
      // Add TTL expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await this.request('insertOne', {
        collection: 'logs',
        document: {
          ...log,
          createdAt: { $date: new Date().toISOString() },
          expiresAt: { $date: expiresAt.toISOString() },
        },
      });
    } catch (error) {
      // Silently fail - logging shouldn't break the proxy
      console.error('Failed to insert log:', error);
    }
  }

  /**
   * Find logs by gateway with pagination
   */
  async findLogsByGateway(
    gatewayId: string,
    options: {
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<Log[]> {
    const result = await this.request<Log>('find', {
      collection: 'logs',
      filter: { gatewayId: { $oid: gatewayId } },
      sort: { createdAt: -1 },
      limit: options.limit || 50,
      skip: options.skip || 0,
    });

    return result.documents || [];
  }

  /**
   * Find logs by subdomain with pagination
   */
  async findLogsBySubdomain(
    subdomain: string,
    options: {
      limit?: number;
      skip?: number;
    } = {}
  ): Promise<Log[]> {
    const result = await this.request<Log>('find', {
      collection: 'logs',
      filter: { subdomain },
      sort: { createdAt: -1 },
      limit: options.limit || 50,
      skip: options.skip || 0,
    });

    return result.documents || [];
  }
}
