/**
 * Magic Link Login API
 * POST /api/auth/login
 *
 * Generates a magic link and sends it via email
 */

import { MongoClient } from 'mongodb';

interface Env {
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
  RESEND_API_KEY: string;
  APP_URL: string;
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

function generateToken(): string {
  // Generate a secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sendMagicLinkEmail(email: string, magicLink: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Toran Admin <noreply@toran.dev>',
        to: [email],
        subject: 'Your Toran Admin Login Link',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
                .footer { margin-top: 40px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔐 Toran Admin Login</h1>
                <p>Click the button below to log in to your Toran Admin panel:</p>
                <p>
                  <a href="${magicLink}" class="button">Log In to Toran Admin</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${magicLink}">${magicLink}</a></p>
                <p class="footer">
                  This link will expire in 15 minutes. If you didn't request this login, you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Check if required environment variables are set
    if (!context.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({
          error: 'Email service not configured. Please contact administrator.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await context.request.json() as { email: string };

    if (!body.email || typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = body.email.toLowerCase().trim();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in database
    const client = await getMongoClient(context.env);
    const db = client.db(context.env.MONGODB_DATABASE || 'toran');

    await db.collection('magic_links').insertOne({
      email,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    // Build magic link URL
    const appUrl = context.env.APP_URL || 'https://toran-admin.pages.dev';
    const magicLink = `${appUrl}/auth/verify?token=${token}`;

    // Send email
    const emailSent = await sendMagicLinkEmail(
      email,
      magicLink,
      context.env.RESEND_API_KEY
    );

    if (!emailSent) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link sent! Check your email.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
