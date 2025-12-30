/**
 * MongoDB Setup Script
 *
 * Creates collections and indexes for Toran API Gateway
 * Run with: node scripts/setup-mongodb.js
 */

const { MongoClient } = require('mongodb');

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'toran';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable not set');
  console.log('\nUsage:');
  console.log('  export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net"');
  console.log('  export MONGODB_DATABASE="toran"');
  console.log('  node scripts/setup-mongodb.js');
  process.exit(1);
}

async function setupMongoDB() {
  console.log('🔧 Setting up MongoDB for Toran API Gateway\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    const db = client.db(DATABASE_NAME);

    // ========================================================================
    // Create Collections
    // ========================================================================
    console.log('📦 Creating collections...');

    const collections = await db.listCollections().toArray();
    const existingCollections = collections.map(c => c.name);

    // Create gateways collection
    if (!existingCollections.includes('gateways')) {
      await db.createCollection('gateways');
      console.log('  ✓ Created gateways collection');
    } else {
      console.log('  ⊘ gateways collection already exists');
    }

    // Create routes collection
    if (!existingCollections.includes('routes')) {
      await db.createCollection('routes');
      console.log('  ✓ Created routes collection');
    } else {
      console.log('  ⊘ routes collection already exists');
    }

    // Create logs collection
    if (!existingCollections.includes('logs')) {
      await db.createCollection('logs');
      console.log('  ✓ Created logs collection');
    } else {
      console.log('  ⊘ logs collection already exists');
    }

    console.log('');

    // ========================================================================
    // Create Indexes
    // ========================================================================
    console.log('🔍 Creating indexes...\n');

    // Gateways indexes
    console.log('  Gateways:');
    await db.collection('gateways').createIndex(
      { subdomain: 1 },
      { unique: true }
    );
    console.log('    ✓ subdomain (unique)');

    await db.collection('gateways').createIndex({ userId: 1 });
    console.log('    ✓ userId');

    await db.collection('gateways').createIndex({ organizationId: 1 });
    console.log('    ✓ organizationId');

    await db.collection('gateways').createIndex({ active: 1, subdomain: 1 });
    console.log('    ✓ active + subdomain');

    // Routes indexes
    console.log('\n  Routes:');
    await db.collection('routes').createIndex({ gatewayId: 1, priority: -1 });
    console.log('    ✓ gatewayId + priority (desc)');

    await db.collection('routes').createIndex({ gatewayId: 1, path: 1, method: 1 });
    console.log('    ✓ gatewayId + path + method');

    await db.collection('routes').createIndex({ gatewayId: 1, active: 1, priority: -1 });
    console.log('    ✓ gatewayId + active + priority');

    await db.collection('routes').createIndex({ tags: 1 });
    console.log('    ✓ tags');

    // Logs indexes
    console.log('\n  Logs:');
    await db.collection('logs').createIndex({ gatewayId: 1, createdAt: -1 });
    console.log('    ✓ gatewayId + createdAt (desc)');

    await db.collection('logs').createIndex({ subdomain: 1, createdAt: -1 });
    console.log('    ✓ subdomain + createdAt (desc)');

    await db.collection('logs').createIndex({ routeId: 1, createdAt: -1 });
    console.log('    ✓ routeId + createdAt (desc)');

    await db.collection('logs').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
    console.log('    ✓ expiresAt (TTL index for auto-deletion)');

    await db.collection('logs').createIndex({ 'error.phase': 1, createdAt: -1 });
    console.log('    ✓ error.phase + createdAt');

    await db.collection('logs').createIndex({ 'execution.cacheHit': 1, createdAt: -1 });
    console.log('    ✓ execution.cacheHit + createdAt');

    console.log('\n✅ MongoDB setup complete!\n');
    console.log('Next steps:');
    console.log('  1. Run: node scripts/seed-data.js (to add test data)');
    console.log('  2. Configure Cloudflare Worker secrets');
    console.log('  3. Deploy: npm run deploy:worker\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run setup
setupMongoDB();
