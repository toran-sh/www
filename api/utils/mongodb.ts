/**
 * MongoDB Connection Utility for Vercel
 */

import { MongoClient } from 'mongodb';

// MongoDB connection (reuse across requests)
let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export function getDatabase(client: MongoClient, dbName?: string) {
  const databaseName = dbName || process.env.MONGODB_DATABASE || 'toran';
  return client.db(databaseName);
}
