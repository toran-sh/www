/**
 * Request/Response logging module for Toran proxy
 */

import type { MongoDBClient } from './database';
import type { ProxyResult } from './types';

const MAX_BODY_SIZE = 10240; // 10KB limit for logged bodies

/**
 * Log request and response to MongoDB (asynchronous)
 */
export async function logRequestResponse(
  request: Request,
  response: Response,
  subdomain: string,
  mappingId: string,
  proxyResult: ProxyResult,
  db: MongoDBClient
): Promise<void> {
  try {
    const url = new URL(request.url);

    // Parse query parameters
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Clone request/response to read bodies
    const requestClone = request.clone();
    const responseClone = response.clone();

    // Read request body (with size limit)
    const requestBody = await readBody(requestClone, MAX_BODY_SIZE);

    // Read response body (with size limit)
    const responseBody = await readBody(responseClone, MAX_BODY_SIZE);

    // Sanitize headers (remove sensitive data)
    const requestHeaders = sanitizeHeaders(request.headers);
    const responseHeaders = sanitizeHeaders(response.headers);

    // Create log entry
    const logEntry = {
      subdomain,
      mappingId,
      request: {
        method: request.method,
        url: request.url,
        path: url.pathname,
        query,
        headers: requestHeaders,
        body: requestBody.body,
        bodySize: requestBody.size,
        ip: request.headers.get('cf-connecting-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        country: request.headers.get('cf-ipcountry') || undefined,
      },
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody.body,
        bodySize: responseBody.size,
      },
      timing: {
        startedAt: proxyResult.timing.startedAt.toISOString(),
        completedAt: proxyResult.timing.completedAt.toISOString(),
        duration: proxyResult.timing.duration,
      },
      error: proxyResult.error,
      createdAt: new Date().toISOString(),
    };

    // Insert log into MongoDB
    await db.insertLog(logEntry);
  } catch (error) {
    console.error('Failed to log request/response:', error);
    // Silently fail - logging shouldn't break the proxy
  }
}

/**
 * Read request/response body with size limit
 */
async function readBody(
  requestOrResponse: Request | Response,
  maxSize: number
): Promise<{ body: string; size: number; truncated: boolean }> {
  try {
    const arrayBuffer = await requestOrResponse.arrayBuffer();
    const size = arrayBuffer.byteLength;

    if (size === 0) {
      return { body: '', size: 0, truncated: false };
    }

    // Truncate if too large
    const truncated = size > maxSize;
    const buffer = truncated ? arrayBuffer.slice(0, maxSize) : arrayBuffer;

    // Try to decode as text
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(buffer);

    const body = truncated ? text + '\n[...TRUNCATED]' : text;

    return { body, size, truncated };
  } catch (error) {
    console.error('Failed to read body:', error);
    return { body: '[Failed to read body]', size: 0, truncated: false };
  }
}

/**
 * Sanitize headers (remove sensitive data)
 */
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};

  const SENSITIVE_HEADERS = new Set([
    'authorization',
    'cookie',
    'set-cookie',
    'api-key',
    'x-api-key',
    'x-auth-token',
    'x-session-token',
  ]);

  for (const [key, value] of headers.entries()) {
    if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
