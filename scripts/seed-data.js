/**
 * Data Seeding Script
 *
 * Seeds test gateway and routes for Toran API Gateway
 * Run with: node scripts/seed-data.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'toran';

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI environment variable not set');
  console.log('\nUsage:');
  console.log('  export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net"');
  console.log('  export MONGODB_DATABASE="toran"');
  console.log('  node scripts/seed-data.js');
  process.exit(1);
}

async function seedData() {
  console.log('🌱 Seeding test data for Toran API Gateway\n');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db(DATABASE_NAME);

    // ========================================================================
    // Create Test Gateway
    // ========================================================================
    console.log('📦 Creating test gateway...');

    const gateway = {
      subdomain: 'test',
      name: 'Test Gateway',
      description: 'Example gateway for testing Toran features',
      baseUrl: 'https://jsonplaceholder.typicode.com',
      active: true,
      variables: {
        BASE_URL: {
          value: 'https://jsonplaceholder.typicode.com',
          description: 'Test API base URL',
          secret: false,
        },
        API_KEY: {
          value: 'test-api-key-12345',
          description: 'Example API key (not real)',
          secret: true,
        },
      },
      defaults: {
        timeout: 30000,
        followRedirects: true,
        cacheEnabled: true,
        logLevel: 'full',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRequests: 0,
        totalRoutes: 0,
        lastRequestAt: null,
      },
    };

    const gatewayResult = await db.collection('gateways').insertOne(gateway);
    const gatewayId = gatewayResult.insertedId;
    console.log(`  ✓ Created gateway: test.toran.dev (ID: ${gatewayId})\n`);

    // ========================================================================
    // Create Test Routes
    // ========================================================================
    console.log('🛤️  Creating test routes...\n');

    // Route 1: Get Post by ID (with caching)
    const route1 = {
      gatewayId: gatewayId,
      path: '/posts/:id',
      method: ['GET'],
      priority: 100,
      active: true,
      destination: {
        type: 'proxy',
        url: '${BASE_URL}/posts/${params.id}',
        preservePath: false,
      },
      parameters: {
        id: {
          type: 'number',
          required: true,
          description: 'Post ID',
        },
      },
      preMutations: {
        headers: [
          {
            type: 'add',
            key: 'X-Gateway',
            value: 'Toran-Test',
          },
        ],
        queryParams: [],
        body: [],
      },
      postMutations: {
        headers: [
          {
            type: 'add',
            key: 'X-Cached-By',
            value: 'Toran',
          },
        ],
        body: [],
      },
      cache: {
        enabled: true,
        ttl: 300, // 5 minutes
        varyBy: {
          path: true,
          method: true,
          queryParams: [],
          headers: [],
          body: false,
        },
        conditions: {
          statusCodes: [200],
          maxBodySize: 10240,
        },
      },
      name: 'Get Post by ID',
      description: 'Fetch a single post from JSONPlaceholder API with caching',
      tags: ['posts', 'test', 'cached'],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgDuration: 0,
        lastRequestAt: null,
      },
    };

    await db.collection('routes').insertOne(route1);
    console.log('  ✓ Route 1: GET /posts/:id (cached)');

    // Route 2: List Posts (with query params)
    const route2 = {
      gatewayId: gatewayId,
      path: '/posts',
      method: ['GET'],
      priority: 90,
      active: true,
      destination: {
        type: 'proxy',
        url: '${BASE_URL}/posts',
        preservePath: false,
      },
      parameters: {},
      preMutations: {
        headers: [],
        queryParams: [
          {
            type: 'add',
            key: '_limit',
            value: '10',
          },
        ],
        body: [],
      },
      postMutations: {
        headers: [],
        body: [],
      },
      cache: {
        enabled: true,
        ttl: 60, // 1 minute
        varyBy: {
          path: true,
          method: true,
          queryParams: ['_limit', '_page'],
          headers: [],
          body: false,
        },
        conditions: {
          statusCodes: [200],
        },
      },
      name: 'List Posts',
      description: 'List posts with pagination',
      tags: ['posts', 'list'],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgDuration: 0,
        lastRequestAt: null,
      },
    };

    await db.collection('routes').insertOne(route2);
    console.log('  ✓ Route 2: GET /posts (with query mutations)');

    // Route 3: Create Post (with body transformation)
    const route3 = {
      gatewayId: gatewayId,
      path: '/posts',
      method: ['POST'],
      priority: 95,
      active: true,
      destination: {
        type: 'proxy',
        url: '${BASE_URL}/posts',
        preservePath: false,
      },
      parameters: {},
      preMutations: {
        headers: [
          {
            type: 'add',
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
        queryParams: [],
        body: [
          {
            type: 'json-map',
            jsonMap: {
              title: 'title',
              content: 'body',
              authorId: 'userId',
            },
          },
        ],
      },
      postMutations: {
        headers: [],
        body: [],
      },
      cache: {
        enabled: false,
      },
      name: 'Create Post',
      description: 'Create a new post with body transformation',
      tags: ['posts', 'create', 'mutation'],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgDuration: 0,
        lastRequestAt: null,
      },
    };

    await db.collection('routes').insertOne(route3);
    console.log('  ✓ Route 3: POST /posts (with body mutation)');

    // Route 4: Catch-all wildcard
    const route4 = {
      gatewayId: gatewayId,
      path: '/users/*',
      method: ['*'],
      priority: 10,
      active: true,
      destination: {
        type: 'proxy',
        url: '${BASE_URL}',
        preservePath: true,
      },
      parameters: {},
      preMutations: {
        headers: [],
        queryParams: [],
        body: [],
      },
      postMutations: {
        headers: [],
        body: [],
      },
      cache: {
        enabled: false,
      },
      name: 'User Wildcard',
      description: 'Catch-all route for /users/* endpoints',
      tags: ['users', 'wildcard'],
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgDuration: 0,
        lastRequestAt: null,
      },
    };

    await db.collection('routes').insertOne(route4);
    console.log('  ✓ Route 4: * /users/* (wildcard)');

    // Update gateway stats
    await db.collection('gateways').updateOne(
      { _id: gatewayId },
      { $set: { 'stats.totalRoutes': 4 } }
    );

    console.log('\n✅ Seeding complete!\n');
    console.log('Test gateway created:');
    console.log('  Subdomain: test.toran.dev');
    console.log('  Routes: 4');
    console.log('\nExample requests:');
    console.log('  curl https://test.toran.dev/posts/1');
    console.log('  curl https://test.toran.dev/posts');
    console.log('  curl https://test.toran.dev/users/1');
    console.log('\nNext steps:');
    console.log('  1. Configure Cloudflare Worker secrets');
    console.log('  2. Deploy: npm run deploy:worker');
    console.log('  3. Test the endpoints above\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run seeding
seedData();
