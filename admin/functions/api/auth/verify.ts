/**
 * Verify Magic Link API
 * GET /api/auth/verify?token=xxx
 *
 * Validates the magic link token and creates a session
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

function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = await getMongoClient(context.env);
    const db = client.db(context.env.MONGODB_DATABASE || 'toran');

    // Find and validate magic link
    const magicLink = await db.collection('magic_links').findOne({ token });

    if (!magicLink) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date() > new Date(magicLink.expiresAt)) {
      // Clean up expired token
      await db.collection('magic_links').deleteOne({ token });

      return new Response(
        JSON.stringify({ error: 'Token has expired. Please request a new login link.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create session
    const sessionId = generateSessionId();
    const now = new Date();

    await db.collection('sessions').insertOne({
      sessionId,
      email: magicLink.email,
      createdAt: now,
      lastActivity: now,
    });

    // Delete used magic link
    await db.collection('magic_links').deleteOne({ token });

    // Set session cookie (SameSite=Lax allows cookie on top-level navigations like magic links)
    const cookieValue = `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`; // 24 hours

    return new Response(
      JSON.stringify({
        success: true,
        email: magicLink.email,
        redirectTo: '/',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieValue,
        },
      }
    );

  } catch (error) {
    console.error('Verify error:', error);
    return new Response(
      JSON.stringify({
        error: 'An error occurred while verifying your login. Please try again.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
