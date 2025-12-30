/**
 * Logout API
 * POST /api/auth/logout
 *
 * Destroys the user's session
 */

import { MongoClient } from 'mongodb';

interface Env {
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
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

function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const sessionId = getSessionFromCookie(context.request.headers.get('Cookie'));

    if (sessionId) {
      const client = await getMongoClient(context.env);
      const db = client.db(context.env.MONGODB_DATABASE || 'toran');

      // Delete session from database
      await db.collection('sessions').deleteOne({ sessionId });
    }

    // Clear session cookie
    const cookieValue = 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

    return new Response(
      JSON.stringify({ success: true, message: 'Logged out successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieValue,
        },
      }
    );

  } catch (error) {
    console.error('Logout error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while logging out. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
