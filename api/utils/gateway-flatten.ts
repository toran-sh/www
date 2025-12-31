/**
 * Gateway Flattening Utility
 * Shared between gateway-config endpoint and gateway CRUD operations
 */

import type { Gateway, Route } from '../../shared/src/types';
import type { KVAdapter } from './kv';

export interface FlattenedGateway {
  id: string;
  subdomain: string;
  name: string;
  baseUrl: string;
  active: boolean;
  variables: Record<string, string>;
  defaults: {
    timeout: number;
    followRedirects: boolean;
    cacheEnabled: boolean;
    logLevel: string;
  };
  routes: FlattenedRoute[];
  version: string;
}

export interface FlattenedRoute {
  _id?: string;
  id: string;
  path: string;
  method: string[];
  priority: number;
  active: boolean;
  pathRegex: string;
  destination: any;
  parameters: any;
  preMutations: any;
  postMutations: any;
  cache?: any;
  name: string;
}

/**
 * Compile path pattern to regex
 * /users/:id -> ^/users/([^/]+)$
 * /api/* -> ^/api/.*$
 */
export function compilePath(path: string): string {
  let pattern = path
    .replace(/:\w+/g, '([^/]+)')  // :param -> capture group
    .replace(/\*/g, '.*');         // * -> match anything

  return `^${pattern}$`;
}

/**
 * Flatten gateway configuration for Worker consumption
 */
export function flattenGateway(gateway: Gateway, routes: Route[]): FlattenedGateway {
  // Extract simple key-value variables
  const variables: Record<string, string> = {};
  for (const [key, config] of Object.entries(gateway.variables || {})) {
    variables[key] = config.value;
  }

  // Sort routes by priority (highest first) and compile regex
  const sortedRoutes = [...routes]
    .filter(r => r.active)
    .sort((a, b) => b.priority - a.priority);

  const flattenedRoutes: FlattenedRoute[] = sortedRoutes.map(route => ({
    _id: route._id?.toString(),
    id: route._id?.toString() || '',
    path: route.path,
    method: route.method,
    priority: route.priority,
    active: route.active,
    pathRegex: compilePath(route.path),
    destination: route.destination,
    parameters: route.parameters || {},
    preMutations: route.preMutations || {},
    postMutations: route.postMutations || {},
    cache: route.cache,
    name: route.name,
  }));

  return {
    id: gateway._id?.toString() || '',
    subdomain: gateway.subdomain,
    name: gateway.name,
    baseUrl: gateway.baseUrl,
    active: gateway.active,
    variables,
    defaults: gateway.defaults,
    routes: flattenedRoutes,
    version: new Date().toISOString(),
  };
}

/**
 * Write flattened gateway config to KV
 */
export async function writeGatewayToKV(
  subdomain: string,
  flattened: FlattenedGateway,
  kv: KVAdapter
): Promise<void> {
  const key = `gateway:config:${subdomain}`;

  try {
    await kv.put(key, JSON.stringify(flattened));
    console.log(`Gateway config written to KV: ${key}`);
  } catch (error) {
    console.error('Failed to write gateway config to KV:', error);
    throw error;
  }
}

/**
 * Delete gateway config from KV
 */
export async function deleteGatewayFromKV(
  subdomain: string,
  kv: KVAdapter
): Promise<void> {
  const key = `gateway:config:${subdomain}`;

  try {
    await kv.delete(key);
    console.log(`Gateway config deleted from KV: ${key}`);
  } catch (error) {
    console.error('Failed to delete gateway config from KV:', error);
    throw error;
  }
}
