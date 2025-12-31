/**
 * Vercel KV Adapter
 * Provides KV storage using Vercel KV
 */

import { kv } from '@vercel/kv';

export interface KVAdapter {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export const vercelKV: KVAdapter = {
  async get(key: string): Promise<string | null> {
    try {
      return await kv.get(key);
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  },

  async put(key: string, value: string): Promise<void> {
    try {
      await kv.set(key, value);
    } catch (error) {
      console.error('KV put error:', error);
      throw error;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await kv.del(key);
    } catch (error) {
      console.error('KV delete error:', error);
      throw error;
    }
  },
};
