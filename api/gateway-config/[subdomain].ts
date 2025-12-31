/**
 * Vercel API Route - Gateway Config
 * GET /api/gateway-config/:subdomain
 *
 * Fetches gateway config from KV for the proxy worker
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelKV } from '../utils/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subdomain } = req.query;

    if (!subdomain || typeof subdomain !== 'string') {
      return res.status(400).json({ error: 'Subdomain is required' });
    }

    const key = `gateway:config:${subdomain}`;
    const config = await vercelKV.get(key);

    if (!config) {
      return res.status(404).json({ error: 'Gateway not found' });
    }

    const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;

    return res.status(200).json(parsedConfig);

  } catch (error) {
    console.error('Gateway config error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
