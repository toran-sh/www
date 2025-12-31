/**
 * Session Check API
 * GET /api/auth/session
 *
 * Checks if user has valid session and updates last activity
 */

import { MongoClient } from 'mongodb';

interface Env {
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
}

async function getMongoClient(env: Env): Promise<MongoClient> {
  const client = new MongoClient(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5 second timeout
    connectTimeoutMS: 5000,
  });
  await client.connect();
  return client;
}

function getSessionFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const sessionId = getSessionFromCookie(context.request.headers.get('Cookie'));

    if (!sessionId) {
      return new Response(
        JSON.stringify({ authenticated: false }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await getMongoClient(context.env);
    const db = client.db(context.env.MONGODB_DATABASE || 'toran');

    // Find session
    const session = await db.collection('sessions').findOne({ sessionId });

    if (!session) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'Session not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if session expired (24 hours of inactivity)
    const lastActivity = new Date(session.lastActivity);
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceActivity >= 24) {
      // Session expired, delete it
      await db.collection('sessions').deleteOne({ sessionId });

      return new Response(
        JSON.stringify({ authenticated: false, error: 'Session expired' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update last activity
    await db.collection('sessions').updateOne(
      { sessionId },
      { $set: { lastActivity: now } }
    );

    return new Response(
      JSON.stringify({
        authenticated: true,
        email: session.email,
        lastActivity: session.lastActivity,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Session check error:', error);
    return new Response(
      JSON.stringify({
        authenticated: false,
        error: 'An error occurred while checking your session.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
