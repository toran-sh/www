/**
 * Redis KV Adapter
 * Provides KV storage using Redis
 */

import Redis from 'ioredis';

export interface KVAdapter {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

// Singleton Redis client
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('error', (error) => {
    console.error('Redis client error:', error);
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  return redisClient;
}

export const redisKV: KVAdapter = {
  async get(key: string): Promise<string | null> {
    try {
      const client = getRedisClient();
      return await client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  async put(key: string, value: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.set(key, value);
    } catch (error) {
      console.error('Redis put error:', error);
      throw error;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  },
};

// For backward compatibility, export as default KV adapter
export const kv = redisKV;
