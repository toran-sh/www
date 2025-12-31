/**
 * Vercel API Route - Magic Link Login API
 * POST /api/auth/login
 *
 * Generates a magic link and sends it via email
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMongoClient, getDatabase } from '../utils/mongodb';
import { getAppUrl } from '../utils/request-url';

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
        from: 'toran.dev admin <noreply@toran.sh>',
        to: [email],
        subject: 'Your toran.dev admin Login Link',
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
                <h1>🔐 toran.dev admin Login</h1>
                <p>Click the button below to log in to your toran.dev admin panel:</p>
                <p>
                  <a href="${magicLink}" class="button">Log In to toran.dev admin</a>
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return res.status(500).json({
        error: 'Email service not configured. Please contact administrator.'
      });
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Generate magic link token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in database
    const client = await getMongoClient();
    const db = getDatabase(client);

    await db.collection('magic_links').insertOne({
      email: normalizedEmail,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    // Build magic link URL
    const appUrl = getAppUrl(req);
    const magicLink = `${appUrl}/auth/verify?token=${token}`;

    // Send email
    const emailSent = await sendMagicLinkEmail(
      normalizedEmail,
      magicLink,
      process.env.RESEND_API_KEY
    );

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send email. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Magic link sent! Check your email.',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'An error occurred while processing your request. Please try again.',
    });
  }
}
