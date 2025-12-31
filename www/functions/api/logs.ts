/**
 * Cloudflare Pages Function - Logging API
 *
 * Endpoints:
 * POST   /api/logs - Receive log from proxy worker
 * GET    /api/logs - Query logs (with filters)
 */

import { MongoClient, ObjectId } from 'mongodb';
import type { Log } from '../../../shared/src/types';

interface Env {
  MONGODB_URI: string;
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
 * Handle POST /api/logs - Receive log from proxy
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const log = await request.json() as Partial<Log>;

    // Validate required fields
    if (!log.subdomain || !log.request || !log.response) {
      return jsonResponse({ error: 'Invalid log data' }, 400);
    }

    // Add timestamps and TTL
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day TTL

    const logEntry: Partial<Log> = {
      ...log,
      createdAt: now,
      expiresAt,
    };

    // Insert into MongoDB
    const client = await getMongoClient(env);
    const db = client.db('toran');
    const logs = db.collection<Log>('logs');

    await logs.insertOne(logEntry as Log);

    return jsonResponse({ success: true, id: (logEntry as any)._id }, 201);

  } catch (error) {
    console.error('Log insert error:', error);
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Failed to insert log'
    }, 500);
  }
};

/**
 * Handle GET /api/logs - Query logs with filters
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    const client = await getMongoClient(env);
    const db = client.db('toran');
    const logs = db.collection<Log>('logs');

    // Parse query parameters
    const subdomain = url.searchParams.get('subdomain');
    const gatewayId = url.searchParams.get('gatewayId');
    const routeId = url.searchParams.get('routeId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const skip = parseInt(url.searchParams.get('skip') || '0');

    // Build filter
    const filter: any = {};
    if (subdomain) filter.subdomain = subdomain;
    if (gatewayId) filter.gatewayId = gatewayId;
    if (routeId) filter.routeId = routeId;

    // Query logs
    const result = await logs
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await logs.countDocuments(filter);

    return jsonResponse({
      logs: result,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + result.length < total,
      },
    });

  } catch (error) {
    console.error('Log query error:', error);
    return jsonResponse({
      error: error instanceof Error ? error.message : 'Failed to query logs'
    }, 500);
  }
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
