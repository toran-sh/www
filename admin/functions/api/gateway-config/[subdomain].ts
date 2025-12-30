/**
 * Gateway Config API Endpoint
 * Returns flattened gateway configuration for Worker consumption
 *
 * GET /api/gateway-config/:subdomain
 */

import { MongoClient, ObjectId } from 'mongodb';
import type { Gateway, Route } from '../../../../shared/src/types';

interface Env {
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
}

interface FlattenedGateway {
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

interface FlattenedRoute {
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

let cachedClient: MongoClient | null = null;

async function getMongoClient(env: Env): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

function compilePath(path: string): string {
  // Convert route path to regex pattern
  // /users/:id -> ^/users/([^/]+)$
  // /api/* -> ^/api/.*$

  let pattern = path
    .replace(/:\w+/g, '([^/]+)')  // :param -> capture group
    .replace(/\*/g, '.*');         // * -> match anything

  return `^${pattern}$`;
}

function flattenGateway(gateway: Gateway, routes: Route[]): FlattenedGateway {
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { subdomain } = context.params;

  if (!subdomain || typeof subdomain !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Subdomain parameter required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const client = await getMongoClient(context.env);
    const db = client.db(context.env.MONGODB_DATABASE || 'toran');

    // Find gateway by subdomain
    const gateway = await db.collection<Gateway>('gateways').findOne({
      subdomain,
      active: true,
    });

    if (!gateway) {
      return new Response(
        JSON.stringify({
          error: 'Gateway not found',
          code: 'GATEWAY_NOT_FOUND',
          subdomain,
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find all active routes for this gateway
    // Try both string and ObjectId formats for gatewayId
    const gatewayIdString = gateway._id!.toString();
    const routes = await db.collection<Route>('routes')
      .find({
        $or: [
          { gatewayId: gatewayIdString },
          { gatewayId: gateway._id }
        ],
        active: true,
      })
      .toArray();

    // Flatten configuration
    const flattened = flattenGateway(gateway, routes);

    return new Response(JSON.stringify(flattened), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });

  } catch (error) {
    console.error('Error fetching gateway config:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while fetching gateway configuration.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
