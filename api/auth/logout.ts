/**
 * Vercel API Route - Logout
 * POST /api/auth/logout
 *
 * Destroys session and clears cookie
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongoClient, getDatabase } from '../utils/mongodb.js';

function getSessionIdFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = getSessionIdFromCookie(req.headers.cookie);

    if (sessionId) {
      const client = await getMongoClient();
      const db = getDatabase(client);

      // Delete session from database
      await db.collection('sessions').deleteOne({ sessionId });
    }

    // Clear cookie
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'An error occurred while logging out.',
    });
  }
}
