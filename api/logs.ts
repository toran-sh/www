/**
 * Vercel API Route - Logs API
 * Receives logs from the proxy worker
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongoClient, getDatabase } from './utils/mongodb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await getMongoClient();
    const db = getDatabase(client);
    const logs = db.collection('logs');

    // Receive log from proxy
    if (method === 'POST') {
      const body = req.body;

      // Create log entry with 30-day expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const logEntry = {
        ...body,
        createdAt: new Date(),
        expiresAt,
      };

      await logs.insertOne(logEntry);

      return res.status(200).json({ success: true });
    }

    // Get logs (for dashboard)
    if (method === 'GET') {
      const { subdomain, limit = '100', skip = '0' } = req.query;

      const query: any = {};
      if (subdomain) {
        query.subdomain = subdomain;
      }

      const result = await logs
        .find(query)
        .sort({ 'request.timestamp': -1 })
        .skip(parseInt(skip as string))
        .limit(parseInt(limit as string))
        .toArray();

      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Logs API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
