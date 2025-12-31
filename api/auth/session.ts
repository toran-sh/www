/**
 * Vercel API Route - Session Check
 * GET /api/auth/session
 *
 * Checks if user has valid session
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongoClient, getDatabase } from '../utils/mongodb';

function getSessionIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);

    if (!sessionId) {
      return res.status(401).json({ error: 'No session found' });
    }

    const client = await getMongoClient();
    const db = getDatabase(client);

    // Find session
    const session = await db.collection('sessions').findOne({
      sessionId,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update last activity
    await db.collection('sessions').updateOne(
      { sessionId },
      { $set: { lastActivity: new Date() } }
    );

    return res.status(200).json({
      authenticated: true,
      email: session.email,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({
      error: 'An error occurred while checking your session.',
    });
  }
}
