/**
 * Shared type definitions for Toran API Gateway
 */

// Re-export all types
export * from './gateway';
export * from './route';
export * from './log';

/**
 * Cloudflare Worker environment bindings
 */
export interface Env {
  // MongoDB configuration
  MONGODB_API_URL: string;
  MONGODB_API_KEY: string;
  MONGODB_DATABASE: string;

  // Optional KV cache for configs and responses
  CACHE?: KVNamespace;

  // Environment
  ENVIRONMENT?: string;
}

/**
 * MongoDB Data API response structure
 */
export interface MongoDBDataAPIResponse<T> {
  document?: T;
  documents?: T[];
  insertedId?: string;
  matchedCount?: number;
  modifiedCount?: number;
  deletedCount?: number;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

// Legacy types (for backward compatibility during migration)
export interface Mapping {
  _id?: string;
  subdomain: string;
  destinationUrl: string;
  active: boolean;
  preservePath: boolean;
  metadata: {
    name: string;
    description: string;
    tags: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalRequests: number;
    lastRequestAt: Date | null;
  };
}
