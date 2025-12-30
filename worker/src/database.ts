/**
 * MongoDB Data API client for Cloudflare Workers
 * Uses REST API instead of native driver for compatibility
 */

import type { Env, Mapping, MongoDBDataAPIResponse } from '../../shared/types';

const DATA_SOURCE = 'Cluster0'; // Default MongoDB cluster name
const MAPPINGS_COLLECTION = 'mappings';
const LOGS_COLLECTION = 'logs';

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

  /**
   * Find a mapping by subdomain
   */
  async findMappingBySubdomain(subdomain: string): Promise<Mapping | null> {
    const result = await this.request<Mapping>('findOne', {
      collection: MAPPINGS_COLLECTION,
      filter: { subdomain },
    });

    return result.document || null;
  }

  /**
   * Update mapping stats (increment request count, update last request time)
   */
  async updateMappingStats(mappingId: string): Promise<void> {
    try {
      await this.request('updateOne', {
        collection: MAPPINGS_COLLECTION,
        filter: { _id: { $oid: mappingId } },
        update: {
          $inc: { 'stats.totalRequests': 1 },
          $set: { 'stats.lastRequestAt': new Date().toISOString() },
        },
      });
    } catch (error) {
      // Silently fail - stats update shouldn't break the proxy
      console.error('Failed to update mapping stats:', error);
    }
  }

  /**
   * Insert a log entry
   */
  async insertLog(log: Record<string, unknown>): Promise<void> {
    try {
      await this.request('insertOne', {
        collection: LOGS_COLLECTION,
        document: log,
      });
    } catch (error) {
      // Silently fail - logging shouldn't break the proxy
      console.error('Failed to insert log:', error);
    }
  }
}

/**
 * Cache helper for KV namespace (if enabled)
 */
export class CacheHelper {
  private static CACHE_TTL = 60; // 60 seconds cache

  /**
   * Get mapping from cache
   */
  static async getMappingFromCache(
    subdomain: string,
    cache: KVNamespace | undefined
  ): Promise<Mapping | null> {
    if (!cache) return null;

    try {
      const cached = await cache.get(`mapping:${subdomain}`, 'json');
      return cached as Mapping | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Put mapping in cache
   */
  static async putMappingInCache(
    subdomain: string,
    mapping: Mapping,
    cache: KVNamespace | undefined
  ): Promise<void> {
    if (!cache) return;

    try {
      await cache.put(`mapping:${subdomain}`, JSON.stringify(mapping), {
        expirationTtl: this.CACHE_TTL,
      });
    } catch (error) {
      console.error('Cache put error:', error);
    }
  }

  /**
   * Invalidate mapping cache
   */
  static async invalidateMappingCache(
    subdomain: string,
    cache: KVNamespace | undefined
  ): Promise<void> {
    if (!cache) return;

    try {
      await cache.delete(`mapping:${subdomain}`);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}
