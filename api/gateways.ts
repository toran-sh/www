/**
 * Vercel API Route - Gateway CRUD API
 *
 * Endpoints:
 * GET    /api/gateways          - List all gateways
 * POST   /api/gateways          - Create gateway
 * GET    /api/gateways/:id      - Get gateway by ID
 * PUT    /api/gateways/:id      - Update gateway
 * DELETE /api/gateways/:id      - Delete gateway
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import type { Gateway, Route } from '../shared/src/types';
import { flattenGateway, writeGatewayToKV, deleteGatewayFromKV } from './utils/gateway-flatten.js';
import { getMongoClient, getDatabase } from './utils/mongodb.js';
import { kv } from './utils/kv.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, query } = req;
  const id = query.id as string | undefined;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getMongoClient();
    const db = getDatabase(client);
    const gateways = db.collection<Gateway>('gateways');

    // List all gateways
    if (method === 'GET' && !id) {
      const result = await gateways
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(result);
    }

    // Get gateway by ID
    if (method === 'GET' && id) {
      const gateway = await gateways.findOne({ _id: new ObjectId(id) });

      if (!gateway) {
        return res.status(404).json({ error: 'Gateway not found' });
      }

      return res.status(200).json(gateway);
    }

    // Create gateway
    if (method === 'POST') {
      const body = req.body;

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
        await writeGatewayToKV(created.subdomain, flattened, kv);
      }

      return res.status(201).json(created);
    }

    // Update gateway
    if (method === 'PUT' && id) {
      const body = req.body;

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
        { _id: new ObjectId(id) },
        update
      );

      const updated = await gateways.findOne({ _id: new ObjectId(id) });

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
        await writeGatewayToKV(updated.subdomain, flattened, kv);
      }

      return res.status(200).json(updated);
    }

    // Delete gateway
    if (method === 'DELETE' && id) {
      const gateway = await gateways.findOne({ _id: new ObjectId(id) });

      await gateways.deleteOne({ _id: new ObjectId(id) });

      // Delete from KV
      if (gateway) {
        await deleteGatewayFromKV(gateway.subdomain, kv);
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Gateway API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
