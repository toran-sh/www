/**
 * Gateway Loader - Loads and flattens gateway configurations
 *
 * Implements a two-tier caching strategy:
 * 1. KV Cache (1 hour TTL) - Flattened config for ultra-fast access
 * 2. Admin API - Fetches from backend which queries MongoDB
 *
 * Architecture:
 * Worker → KV Cache → Admin API → MongoDB
 *
 * This avoids MongoDB Data API (deprecated) and uses standard MongoDB drivers
 * in the Admin backend (Cloudflare Pages Functions).
 */

import type { Env, FlattenedGateway } from '../../../shared/src/types';

const CACHE_KEY_PREFIX = 'gateway:flattened:';
const CACHE_TTL = 3600; // 1 hour in seconds

export class GatewayLoader {
  /**
   * Load gateway with flattened config from KV cache or Admin API
   */
  static async load(subdomain: string, env: Env): Promise<FlattenedGateway | null> {
    // Try KV cache first
    const cacheKey = `${CACHE_KEY_PREFIX}${subdomain}`;
    const cached = await this.getFromCache(cacheKey, env.CACHE);
    if (cached) {
      return cached;
    }

    // Fetch from Admin API
    const flattened = await this.fetchFromAdminAPI(subdomain, env);
    if (!flattened) {
      return null;
    }

    // Cache for 1 hour
    await this.putInCache(cacheKey, flattened, env.CACHE);

    return flattened;
  }

  /**
   * Fetch gateway config from Admin API
   * The Admin API handles MongoDB queries using standard drivers
   */
  private static async fetchFromAdminAPI(
    subdomain: string,
    env: Env
  ): Promise<FlattenedGateway | null> {
    const adminApiUrl = env.ADMIN_API_URL || 'http://localhost:5173';
    const url = `${adminApiUrl}/api/gateway-config/${subdomain}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Gateway not found
        }
        throw new Error(`Admin API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as FlattenedGateway;

    } catch (error) {
      console.error('Failed to fetch gateway from Admin API:', error);
      return null;
    }
  }


  /**
   * Get flattened config from KV cache
   */
  private static async getFromCache(
    key: string,
    cache: KVNamespace | undefined
  ): Promise<FlattenedGateway | null> {
    if (!cache) return null;

    try {
      // Temporarily bypass cache to force fresh load
      // TODO: Remove this after cache expires or implement proper invalidation
      return null;

      // const cached = await cache.get(key, 'json');
      // return cached as FlattenedGateway | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Put flattened config in KV cache
   */
  private static async putInCache(
    key: string,
    config: FlattenedGateway,
    cache: KVNamespace | undefined
  ): Promise<void> {
    if (!cache) return;

    try {
      await cache.put(key, JSON.stringify(config), {
        expirationTtl: CACHE_TTL,
      });
    } catch (error) {
      console.error('Cache put error:', error);
    }
  }

  /**
   * Invalidate cache when gateway config changes
   * Called from admin UI after updates
   */
  static async invalidate(subdomain: string, cache: KVNamespace | undefined): Promise<void> {
    if (!cache) return;

    const cacheKey = `${CACHE_KEY_PREFIX}${subdomain}`;
    try {
      await cache.delete(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}
