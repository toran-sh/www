/**
 * Request URL Utilities
 * Helper functions for working with request URLs
 */

import type { VercelRequest } from '@vercel/node';

/**
 * Get the application URL from environment or request
 * Priority: 1. APP_URL env var, 2. Request origin, 3. localhost fallback
 *
 * @param req - Vercel request object
 * @returns Application URL (without trailing slash)
 */
export function getAppUrl(req: VercelRequest): string {
  // Use APP_URL if explicitly set
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  // Construct URL from request headers
  const protocol = req.headers['x-forwarded-proto'] ||
                   (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const host = req.headers.host || 'localhost:3000';

  return `${protocol}://${host}`;
}

/**
 * Get the full request URL
 *
 * @param req - Vercel request object
 * @returns Full request URL
 */
export function getRequestUrl(req: VercelRequest): string {
  const appUrl = getAppUrl(req);
  const path = req.url || '/';

  return `${appUrl}${path}`;
}

/**
 * Get the origin (protocol + host) from the request
 *
 * @param req - Vercel request object
 * @returns Origin URL
 */
export function getOrigin(req: VercelRequest): string {
  return getAppUrl(req);
}
