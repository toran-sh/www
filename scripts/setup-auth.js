/**
 * Setup Authentication Collections in MongoDB
 *
 * Creates collections for:
 * - magic_links: Temporary tokens for email-based login
 * - sessions: User sessions with activity tracking
 */

const { MongoClient } = require('mongodb');

// Load environment variables from .env files
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'toran';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable is required');
  console.error('\nPlease set it by either:');
  console.error('  1. Creating a .env file with MONGODB_URI=your_connection_string');
  console.error('  2. Exporting it: export MONGODB_URI="your_connection_string"');
  process.exit(1);
}

async function setupAuth() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(MONGODB_DATABASE);

    // Create magic_links collection
    console.log('\n📧 Creating magic_links collection...');
    try {
      await db.createCollection('magic_links');
      console.log('✅ magic_links collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('⚠️  magic_links collection already exists');
      } else {
        throw error;
      }
    }

    // Create sessions collection
    console.log('\n🔐 Creating sessions collection...');
    try {
      await db.createCollection('sessions');
      console.log('✅ sessions collection created');
    } catch (error) {
      if (error.codeName === 'NamespaceExists') {
        console.log('⚠️  sessions collection already exists');
      } else {
        throw error;
      }
    }

    // Create indexes for magic_links
    console.log('\n📇 Creating indexes for magic_links...');
    await db.collection('magic_links').createIndex(
      { token: 1 },
      { unique: true }
    );
    console.log('✅ Created unique index on token');

    await db.collection('magic_links').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
    console.log('✅ Created TTL index on expiresAt (auto-cleanup)');

    await db.collection('magic_links').createIndex({ email: 1 });
    console.log('✅ Created index on email');

    // Create indexes for sessions
    console.log('\n📇 Creating indexes for sessions...');
    await db.collection('sessions').createIndex(
      { sessionId: 1 },
      { unique: true }
    );
    console.log('✅ Created unique index on sessionId');

    await db.collection('sessions').createIndex({ email: 1 });
    console.log('✅ Created index on email');

    await db.collection('sessions').createIndex(
      { lastActivity: 1 },
      { expireAfterSeconds: 86400 } // 24 hours
    );
    console.log('✅ Created TTL index on lastActivity (24hr auto-logout)');

    console.log('\n✨ Authentication setup complete!');
    console.log('\nCollections created:');
    console.log('  - magic_links (with TTL cleanup)');
    console.log('  - sessions (with 24hr inactivity logout)');

  } catch (error) {
    console.error('\n❌ Error setting up auth:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupAuth();
