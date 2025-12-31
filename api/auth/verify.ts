/**
 * Vercel API Route - Magic Link Verification
 * POST /api/auth/verify
 *
 * Verifies magic link token and creates session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongoClient, getDatabase } from '../utils/mongodb';

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    const client = await getMongoClient();
    const db = getDatabase(client);

    // Find and validate token
    const magicLink = await db.collection('magic_links').findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!magicLink) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.collection('sessions').insertOne({
      sessionId,
      email: magicLink.email,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt,
    });

    // Delete used magic link
    await db.collection('magic_links').deleteOne({ token });

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${24 * 60 * 60}; Path=/`);

    return res.status(200).json({
      success: true,
      email: magicLink.email,
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      error: 'An error occurred while verifying your token.',
    });
  }
}
