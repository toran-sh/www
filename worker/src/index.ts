/**
 * Toran Reverse Proxy - Cloudflare Worker Entry Point
 *
 * Flow:
 * 1. Extract subdomain from request
 * 2. Query MongoDB for mapping (with optional KV caching)
 * 3. Forward request to destination
 * 4. Return response to client
 * 5. Log request/response asynchronously
 */

import type { Env } from '../../shared/types';
import type { SubdomainInfo } from './types';
import { MongoDBClient, CacheHelper } from './database';
import { proxyRequest, validateDestinationUrl } from './proxy';
import { logRequestResponse } from './logger';
import {
  handleSubdomainNotFound,
  handleMappingInactive,
  handleInvalidSubdomain,
  handleConfigurationError,
  handleInternalError,
} from './error-handler';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Validate configuration
      if (!env.MONGODB_API_URL || !env.MONGODB_API_KEY || !env.MONGODB_DATABASE) {
        return handleConfigurationError(
          'MongoDB configuration missing. Please set MONGODB_API_URL, MONGODB_API_KEY, and MONGODB_DATABASE.',
          request
        );
      }

      // Parse subdomain from hostname
      const subdomainInfo = parseSubdomain(request);

      if (!subdomainInfo.isValid) {
        return handleInvalidSubdomain(subdomainInfo.hostname, request);
      }

      const { subdomain } = subdomainInfo;

      // Initialize MongoDB client
      const db = new MongoDBClient(env);

      // Try to get mapping from cache first
      let mapping = await CacheHelper.getMappingFromCache(subdomain, env.CACHE);

      // If not in cache, query MongoDB
      if (!mapping) {
        mapping = await db.findMappingBySubdomain(subdomain);

        // If mapping found, cache it
        if (mapping) {
          ctx.waitUntil(
            CacheHelper.putMappingInCache(subdomain, mapping, env.CACHE)
          );
        }
      }

      // Handle mapping not found
      if (!mapping) {
        return handleSubdomainNotFound(subdomain, request);
      }

      // Handle inactive mapping
      if (!mapping.active) {
        return handleMappingInactive(subdomain, request);
      }

      // Validate destination URL
      if (!validateDestinationUrl(mapping.destinationUrl)) {
        return handleConfigurationError(
          `Invalid destination URL for subdomain '${subdomain}'. Only HTTPS URLs to public servers are allowed.`,
          request
        );
      }

      // Forward request to destination
      const proxyResult = await proxyRequest(request, mapping);

      // Update mapping stats asynchronously (don't block response)
      if (mapping._id) {
        ctx.waitUntil(db.updateMappingStats(mapping._id));
      }

      // Add custom response headers
      const response = new Response(proxyResult.response.body, proxyResult.response);
      response.headers.set('X-Toran-Proxy', 'true');
      response.headers.set('X-Toran-Subdomain', subdomain);

      // Log request/response asynchronously (don't block response)
      ctx.waitUntil(
        logRequestResponse(request, proxyResult.response, subdomain, mapping._id || '', proxyResult, db)
      );

      return response;
    } catch (error) {
      console.error('Unexpected error in worker:', error);
      return handleInternalError(error as Error, request);
    }
  },
};

/**
 * Parse subdomain from request hostname
 */
function parseSubdomain(request: Request): SubdomainInfo {
  const hostname = new URL(request.url).hostname;

  // Extract subdomain (everything before .toran.dev)
  const parts = hostname.split('.');

  // Expected format: subdomain.toran.dev (3 parts)
  if (parts.length !== 3) {
    return {
      subdomain: '',
      hostname,
      isValid: false,
    };
  }

  const subdomain = parts[0];

  // Validate subdomain format (alphanumeric and hyphens only)
  const isValid = /^[a-zA-Z0-9-]+$/.test(subdomain);

  return {
    subdomain,
    hostname,
    isValid,
  };
}
