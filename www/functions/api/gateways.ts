/**
 * Cloudflare Pages Function - Gateway CRUD API
 *
 * Endpoints:
 * GET    /api/gateways          - List all gateways
 * POST   /api/gateways          - Create gateway
 * GET    /api/gateways/:id      - Get gateway by ID
 * PUT    /api/gateways/:id      - Update gateway
 * DELETE /api/gateways/:id      - Delete gateway
 */

import { MongoClient, ObjectId } from 'mongodb';
import type { Gateway, Route } from '../../../shared/src/types';
import { flattenGateway, writeGatewayToKV, deleteGatewayFromKV } from '../utils/gateway-flatten';

interface Env {
  MONGODB_URI: string;
  GATEWAY_CONFIG: KVNamespace;
}

// MongoDB connection (reuse across requests)
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

/**
 * Handle requests to /api/gateways/*
 */
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    const client = await getMongoClient(env);
    const db = client.db('toran');
    const gateways = db.collection<Gateway>('gateways');

    // List all gateways
    if (method === 'GET' && !params.id) {
      const result = await gateways
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return jsonResponse(result);
    }

    // Get gateway by ID
    if (method === 'GET' && params.id) {
      const gateway = await gateways.findOne({ _id: new ObjectId(params.id as string) });

      if (!gateway) {
        return jsonResponse({ error: 'Gateway not found' }, 404);
      }

      return jsonResponse(gateway);
    }

    // Create gateway
    if (method === 'POST') {
      const body = await request.json() as any;

      const gateway: Partial<Gateway> = {
        subdomain: body.subdomain,
        name: body.name,
        description: body.description,
        baseUrl: body.baseUrl,
        active: body.active ?? true,
        variables: body.variables || {},
        defaults: {
          timeout: body.defaults?.timeout || 30000,
          followRedirects: body.defaults?.followRedirects ?? true,
          cacheEnabled: body.defaults?.cacheEnabled ?? false,
          logLevel: body.defaults?.logLevel || 'full',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalRequests: 0,
          totalRoutes: 0,
          lastRequestAt: null,
        },
      };

      const result = await gateways.insertOne(gateway as Gateway);
      const created = await gateways.findOne({ _id: result.insertedId });

      // Write flattened config to KV (with empty routes initially)
      if (created) {
        const flattened = flattenGateway(created, []);
        await writeGatewayToKV(created.subdomain, flattened, env.GATEWAY_CONFIG);
      }

      return jsonResponse(created, 201);
    }

    // Update gateway
    if (method === 'PUT' && params.id) {
      const body = await request.json() as any;

      const update: any = {
        $set: {
          updatedAt: new Date(),
        },
      };

      if (body.name) update.$set.name = body.name;
      if (body.description !== undefined) update.$set.description = body.description;
      if (body.baseUrl) update.$set.baseUrl = body.baseUrl;
      if (body.active !== undefined) update.$set.active = body.active;
      if (body.variables !== undefined) update.$set.variables = body.variables;
      if (body.defaults) update.$set.defaults = body.defaults;

      await gateways.updateOne(
        { _id: new ObjectId(params.id as string) },
        update
      );

      const updated = await gateways.findOne({ _id: new ObjectId(params.id as string) });

      // Write updated flattened config to KV
      if (updated) {
        // Fetch routes for this gateway
        const routes = await db.collection<Route>('routes')
          .find({
            $or: [
              { gatewayId: updated._id!.toString() },
              { gatewayId: updated._id }
            ],
            active: true,
          })
          .toArray();

        const flattened = flattenGateway(updated, routes);
        await writeGatewayToKV(updated.subdomain, flattened, env.GATEWAY_CONFIG);
      }

      return jsonResponse(updated);
    }

    // Delete gateway
    if (method === 'DELETE' && params.id) {
      const gateway = await gateways.findOne({ _id: new ObjectId(params.id as string) });

      await gateways.deleteOne({ _id: new ObjectId(params.id as string) });

      // Delete from KV
      if (gateway) {
        await deleteGatewayFromKV(gateway.subdomain, env.GATEWAY_CONFIG);
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error('Gateway API error:', error);
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500);
  }
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
