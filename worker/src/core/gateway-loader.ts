/**
 * Gateway Loader - Loads and flattens gateway configurations
 *
 * Implements a two-tier caching strategy:
 * 1. KV Cache (1 hour TTL) - Flattened config for ultra-fast access
 * 2. MongoDB - Source of truth
 *
 * Flattened config includes:
 * - Gateway settings and variables
 * - All routes sorted by priority with compiled regex
 */

import type { Env, Gateway, Route, FlattenedGateway } from '../../../shared/src/types';
import { MongoDBClient } from '../database/mongodb-client';

const CACHE_KEY_PREFIX = 'gateway:flattened:';
const CACHE_TTL = 3600; // 1 hour in seconds

export class GatewayLoader {
  /**
   * Load gateway with flattened config from KV cache or MongoDB
   */
  static async load(subdomain: string, env: Env): Promise<FlattenedGateway | null> {
    // Try KV cache first
    const cacheKey = `${CACHE_KEY_PREFIX}${subdomain}`;
    const cached = await this.getFromCache(cacheKey, env.CACHE);
    if (cached) {
      return cached;
    }

    // Load from MongoDB
    const db = new MongoDBClient(env);
    const gateway = await db.findGatewayBySubdomain(subdomain);
    if (!gateway || !gateway.active) {
      return null;
    }

    const routes = await db.findRoutesByGateway(gateway._id!, { active: true });

    // Flatten config for runtime
    const flattened = this.flatten(gateway, routes);

    // Cache for 1 hour
    await this.putInCache(cacheKey, flattened, env.CACHE);

    return flattened;
  }

  /**
   * Flatten gateway and routes for runtime
   *
   * - Extracts only runtime-needed fields
   * - Compiles path patterns to regex
   * - Sorts routes by priority
   * - Flattens variables to simple key-value map
   */
  private static flatten(gateway: Gateway, routes: Route[]): FlattenedGateway {
    // Extract variable values (strip metadata)
    const variables: Record<string, string> = {};
    for (const [key, config] of Object.entries(gateway.variables || {})) {
      variables[key] = config.value;
    }

    // Process routes: compile regex, sort by priority
    const flattenedRoutes = routes
      .map((route) => ({
        ...route,
        pathRegex: this.compilePath(route.path),
      }))
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    // Generate version hash for cache invalidation
    const version = this.generateVersion(gateway, routes);

    return {
      id: gateway._id!,
      subdomain: gateway.subdomain,
      active: gateway.active,
      variables,
      defaults: gateway.defaults,
      routes: flattenedRoutes,
      version,
    };
  }

  /**
   * Compile path pattern to regex
   *
   * Converts route paths like:
   * - "/users/:id" → /^\/users\/([^\/]+)$/
   * - "/api/*" → /^\/api\/(.*)$/
   * - "/posts/:id/comments/:commentId" → /^\/posts\/([^\/]+)\/comments\/([^\/]+)$/
   */
  private static compilePath(path: string): string {
    // Escape special regex characters except : and *
    let pattern = path.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

    // Replace :param with named capture group
    // Store param names for later extraction
    pattern = pattern.replace(/:([a-zA-Z0-9_]+)/g, '([^/]+)');

    // Replace * with wildcard
    pattern = pattern.replace(/\*/g, '(.*)');

    // Anchor to start and end
    pattern = `^${pattern}$`;

    return pattern;
  }

  /**
   * Generate version hash for cache invalidation
   * Simple implementation: just use last updated timestamp
   */
  private static generateVersion(gateway: Gateway, routes: Route[]): string {
    const gatewayTime = gateway.updatedAt ? new Date(gateway.updatedAt).getTime() : 0;
    const routeTimes = routes.map((r) => (r.updatedAt ? new Date(r.updatedAt).getTime() : 0));
    const maxTime = Math.max(gatewayTime, ...routeTimes);
    return `v${maxTime}`;
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
      const cached = await cache.get(key, 'json');
      return cached as FlattenedGateway | null;
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
