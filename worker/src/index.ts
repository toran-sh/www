/**
 * Toran API Gateway - Cloudflare Worker Entry Point
 *
 * Pipeline Flow:
 * 1. Validate configuration
 * 2. Parse subdomain from request
 * 3. Load gateway config (flattened, cached in KV)
 * 4. Match route using compiled regex
 * 5. Build request context (params, variables, etc.)
 * 6. Apply pre-request mutations (headers, query, body)
 * 7. Proxy request to destination
 * 8. Apply post-response mutations (headers, body, status)
 * 9. [Phase 3] Cache response (if enabled)
 * 10. Update stats asynchronously
 * 11. Log request/response with execution breakdown
 * 12. Return response to client
 */

import type { Env } from '../../shared/src/types';
import { GatewayLoader } from './core/gateway-loader';
import { Router } from './core/router';
import { ContextBuilder } from './core/context-builder';
import { Logger } from './logging/logger';
import { MongoDBClient } from './database/mongodb-client';
import { MutationEngine } from './mutations/engine';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const startTime = performance.now();

    try {
      // ========================================================================
      // 1. Validate Configuration
      // ========================================================================
      if (!env.MONGODB_API_URL || !env.MONGODB_API_KEY || !env.MONGODB_DATABASE) {
        return errorResponse('CONFIGURATION_ERROR', 'MongoDB configuration missing', 500);
      }

      // ========================================================================
      // 2. Parse Subdomain
      // ========================================================================
      const routingStart = performance.now();
      const subdomain = extractSubdomain(request);

      if (!subdomain) {
        return errorResponse('INVALID_SUBDOMAIN', 'Invalid or missing subdomain', 400);
      }

      // ========================================================================
      // 3. Load Gateway Config (cached in KV)
      // ========================================================================
      const gateway = await GatewayLoader.load(subdomain, env);

      if (!gateway || !gateway.active) {
        return errorResponse('GATEWAY_NOT_FOUND', `Gateway '${subdomain}' not found or inactive`, 404);
      }

      // ========================================================================
      // 4. Match Route
      // ========================================================================
      const url = new URL(request.url);
      const routeMatch = Router.match(url.pathname, request.method, gateway.routes);
      const routingEnd = performance.now();

      if (!routeMatch) {
        // Build context for logging (no route match)
        const context = await ContextBuilder.build(request, gateway, env, {});

        // Log no-match request
        const db = new MongoDBClient(env);
        ctx.waitUntil(
          Logger.logRequest(
            context,
            new Response('No route matched', { status: 404 }),
            {
              routeId: null,
              routeMatched: false,
              cacheHit: false,
              mutationsApplied: { pre: 0, post: 0 },
              timing: {
                completedAt: new Date(),
                duration: performance.now() - startTime,
                breakdown: {
                  routing: routingEnd - routingStart,
                  proxy: 0,
                },
              },
            },
            db
          )
        );

        return errorResponse('NO_ROUTE_MATCH', 'No route matched for this request', 404);
      }

      const { route, pathParams } = routeMatch;

      // Build named path params using route path
      const namedParams = Router.buildNamedParams(url.pathname, route.pathRegex, route.path);

      // ========================================================================
      // 5. Build Request Context
      // ========================================================================
      const context = await ContextBuilder.build(request, gateway, env, namedParams || pathParams);

      // ========================================================================
      // 6. Apply Pre-Request Mutations
      // ========================================================================
      const preMutationsStart = performance.now();
      const mutatedRequest = await MutationEngine.applyPreMutations(request, route, context);
      const preMutationsEnd = performance.now();

      // ========================================================================
      // 7. Proxy Request to Destination
      // ========================================================================
      const proxyStart = performance.now();
      const destinationUrl = buildDestinationUrl(route, context);

      // Proxy with mutated request
      const proxyResponse = await fetch(destinationUrl, {
        method: mutatedRequest.method,
        headers: mutatedRequest.headers,
        body: mutatedRequest.body,
      });

      const proxyEnd = performance.now();

      // ========================================================================
      // 8. Apply Post-Response Mutations
      // ========================================================================
      const postMutationsStart = performance.now();
      const mutatedResponse = await MutationEngine.applyPostMutations(proxyResponse, route, context);
      const postMutationsEnd = performance.now();

      // ========================================================================
      // 9. Add Response Headers
      // ========================================================================
      const response = mutatedResponse.response;
      response.headers.set('X-Toran-Gateway', subdomain);
      response.headers.set('X-Toran-Route', route.name);

      // ========================================================================
      // 10. Update Stats Asynchronously
      // ========================================================================
      const db = new MongoDBClient(env);
      ctx.waitUntil(db.updateGatewayStats(gateway.id));
      ctx.waitUntil(db.updateRouteStats(route._id!, { cacheHit: false, duration: proxyEnd - proxyStart }));

      // ========================================================================
      // 11. Log Request/Response Asynchronously
      // ========================================================================
      const endTime = performance.now();
      ctx.waitUntil(
        Logger.logRequest(
          context,
          response,
          {
            routeId: route._id!,
            routeName: route.name,
            routeMatched: true,
            cacheHit: false,
            mutationsApplied: {
              pre: mutatedRequest.mutationsApplied,
              post: mutatedResponse.mutationsApplied,
            },
            timing: {
              completedAt: new Date(),
              duration: endTime - startTime,
              breakdown: {
                routing: routingEnd - routingStart,
                preMutations: preMutationsEnd - preMutationsStart,
                proxy: proxyEnd - proxyStart,
                postMutations: postMutationsEnd - postMutationsStart,
              },
            },
          },
          db
        )
      );

      return response;
    } catch (error) {
      console.error('Unexpected error in worker:', error);
      return errorResponse(
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  },
};

/**
 * Extract subdomain from request hostname
 *
 * Expects format: subdomain.toran.dev or subdomain.custom-domain.com
 * Returns subdomain or null if invalid
 */
function extractSubdomain(request: Request): string | null {
  const hostname = new URL(request.url).hostname;

  // Handle localhost for development
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    // For local dev, use query param: ?subdomain=test
    const url = new URL(request.url);
    return url.searchParams.get('subdomain') || 'test';
  }

  // Extract subdomain (first part before first dot)
  const parts = hostname.split('.');

  if (parts.length < 2) {
    return null;
  }

  const subdomain = parts[0];

  // Validate subdomain format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(subdomain)) {
    return null;
  }

  return subdomain;
}

/**
 * Build destination URL from route and context
 *
 * Supports template variables:
 * - ${params.id} - Path parameters
 * - ${variables.API_KEY} - Gateway variables
 * - ${BASE_URL} - Gateway base URL
 */
function buildDestinationUrl(route: any, context: any): string {
  let url = route.destination.url;

  // Simple template substitution (Phase 2 will use proper template engine)
  // Replace ${params.xxx}
  for (const [key, value] of Object.entries(context.params)) {
    url = url.replace(`\${params.${key}}`, value as string);
  }

  // Replace ${variables.xxx}
  for (const [key, value] of Object.entries(context.gateway.variables)) {
    url = url.replace(`\${variables.${key}}`, value as string);
    url = url.replace(`\${${key}}`, value as string); // Shorthand
  }

  return url;
}

/**
 * Create error response
 */
function errorResponse(code: string, message: string, status: number): Response {
  return new Response(
    JSON.stringify({
      error: {
        code,
        message,
      },
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Toran-Error': code,
      },
    }
  );
}
