# MongoDB Setup for Toran API Gateway

This document outlines the MongoDB database schema, indexes, and setup instructions for the Toran API Gateway system.

## Database Overview

Toran uses MongoDB to store gateway configurations, routes, and request/response logs. The database consists of three main collections:

1. **gateways** - Gateway configurations and settings
2. **routes** - Route definitions with mutations and caching rules
3. **logs** - Request/response logs with execution breakdown

## Collections Schema

### 1. Gateways Collection

Stores gateway configurations including subdomain, destination URLs, and settings.

```javascript
db.createCollection("gateways");

// Example document
{
  _id: ObjectId("..."),
  subdomain: "api",                    // Unique subdomain (e.g., api.toran.dev)
  name: "Production API Gateway",
  description: "Main API gateway for production",
  baseUrl: "https://api.example.com",  // Base destination URL
  active: true,

  // User-defined variables (available in templates)
  variables: {
    API_KEY: {
      value: "sk_live_...",
      description: "Production API key",
      secret: true                       // Mask in UI/logs
    },
    BASE_URL: {
      value: "https://api.example.com",
      description: "API base URL",
      secret: false
    }
  },

  defaults: {
    timeout: 30000,                      // 30 seconds
    followRedirects: true,
    cacheEnabled: false,
    logLevel: "full"                     // none | basic | full
  },

  // Multi-tenancy (future)
  userId: "user_123",
  organizationId: "org_456",

  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z"),

  stats: {
    totalRequests: 1500,
    totalRoutes: 10,
    lastRequestAt: ISODate("2024-01-15T12:30:00Z")
  }
}
```

**Required Indexes:**

```javascript
// Unique subdomain index
db.gateways.createIndex({ subdomain: 1 }, { unique: true });

// User lookups (for multi-tenancy)
db.gateways.createIndex({ userId: 1 });
db.gateways.createIndex({ organizationId: 1 });

// Active gateways query
db.gateways.createIndex({ active: 1, subdomain: 1 });
```

### 2. Routes Collection

Stores route definitions with path patterns, mutations, and caching configuration.

```javascript
db.createCollection("routes");

// Example document
{
  _id: ObjectId("..."),
  gatewayId: ObjectId("..."),            // Reference to gateway

  // Route matching
  path: "/users/:id",                    // Supports :params and wildcards *
  method: ["GET", "POST"],               // HTTP methods or ["*"] for all
  priority: 100,                         // Higher = evaluated first
  active: true,

  // Destination configuration
  destination: {
    type: "proxy",                       // proxy | redirect | mock
    url: "${BASE_URL}/v1/users/${params.id}",  // Template with variables
    preservePath: false,
    overridePath: "/api/v2/users"        // Optional path override
  },

  // Path parameter definitions
  parameters: {
    id: {
      type: "uuid",                      // string | number | uuid
      required: true,
      pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
      description: "User ID (UUID format)"
    }
  },

  // Pre-request mutations
  preMutations: {
    headers: [
      {
        type: "add",
        key: "X-API-Key",
        value: "${variables.API_KEY}",
        condition: {
          type: "header",
          operator: "exists",
          key: "Authorization",
          value: null
        }
      },
      {
        type: "remove",
        key: "X-Internal-Token"
      }
    ],
    queryParams: [
      {
        type: "set",
        key: "format",
        value: "json"
      }
    ],
    body: [
      {
        type: "json-map",
        jsonMap: {
          "user.name": "userName",
          "user.email": "emailAddress"
        }
      }
    ]
  },

  // Post-response mutations
  postMutations: {
    headers: [
      {
        type: "add",
        key: "X-Gateway-Version",
        value: "1.0"
      }
    ],
    body: [
      {
        type: "json-path",
        jsonPath: {
          expression: "$.data.users[*].name",
          target: "userNames"
        }
      }
    ],
    status: {
      type: "map",
      map: {
        "404": 200                       // Return 200 instead of 404
      }
    }
  },

  // Caching configuration
  cache: {
    enabled: true,
    ttl: 300,                            // 5 minutes in seconds
    varyBy: {
      path: true,
      method: true,
      queryParams: ["userId", "format"],
      headers: ["Authorization"],
      body: false
    },
    conditions: {
      statusCodes: [200, 201],           // Only cache successful responses
      maxBodySize: 10240                 // 10KB max
    }
  },

  name: "Get User by ID",
  description: "Proxy request to get user details by UUID",
  tags: ["users", "api-v1"],

  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z"),

  stats: {
    totalRequests: 500,
    cacheHits: 250,
    cacheMisses: 250,
    avgDuration: 45,                     // milliseconds
    lastRequestAt: ISODate("2024-01-15T12:30:00Z")
  }
}
```

**Required Indexes:**

```javascript
// Gateway + priority for route matching
db.routes.createIndex({ gatewayId: 1, priority: -1 });

// Gateway + path + method for lookups
db.routes.createIndex({ gatewayId: 1, path: 1, method: 1 });

// Active routes
db.routes.createIndex({ gatewayId: 1, active: 1, priority: -1 });

// Tags for filtering
db.routes.createIndex({ tags: 1 });
```

### 3. Logs Collection

Stores request/response logs with execution breakdown and timing information.

```javascript
db.createCollection("logs");

// Example document
{
  _id: ObjectId("..."),
  gatewayId: ObjectId("..."),
  routeId: ObjectId("..."),              // null if no route matched
  subdomain: "api",

  request: {
    method: "GET",
    url: "https://api.toran.dev/users/123",
    path: "/users/123",
    query: { format: "json" },
    headers: {                           // Sanitized (secrets removed)
      "user-agent": "Mozilla/5.0...",
      "x-forwarded-for": "1.2.3.4"
    },
    body: "",
    bodySize: 0,
    ip: "1.2.3.4",
    userAgent: "Mozilla/5.0...",
    country: "US",
    region: "CA",
    city: "San Francisco",
    pathParams: { id: "123" }            // Extracted path parameters
  },

  response: {
    status: 200,
    statusText: "OK",
    headers: {
      "content-type": "application/json",
      "x-gateway-version": "1.0"
    },
    body: "{\"name\":\"John Doe\"}",     // Truncated if > 10KB
    bodySize: 23
  },

  execution: {
    routeMatched: true,
    routeName: "Get User by ID",
    cacheHit: false,
    mutationsApplied: {
      pre: 2,                            // Header and query mutations
      post: 1                            // Status mutation
    },
    timing: {
      startedAt: ISODate("2024-01-15T12:30:00.000Z"),
      completedAt: ISODate("2024-01-15T12:30:00.150Z"),
      duration: 150,                     // Total duration in ms
      breakdown: {
        routing: 5,
        preMutations: 10,
        proxy: 120,
        postMutations: 10,
        caching: 5
      }
    }
  },

  error: {                               // Optional, only if error occurred
    message: "Connection timeout",
    type: "ProxyError",
    stack: "Error: Connection timeout...",
    phase: "proxy"                       // routing | pre-mutation | proxy | post-mutation | caching
  },

  createdAt: ISODate("2024-01-15T12:30:00Z"),
  expiresAt: ISODate("2024-02-14T12:30:00Z")  // TTL: 30 days
}
```

**Required Indexes:**

```javascript
// Gateway + timestamp for log queries
db.logs.createIndex({ gatewayId: 1, createdAt: -1 });

// Subdomain + timestamp
db.logs.createIndex({ subdomain: 1, createdAt: -1 });

// Route + timestamp
db.logs.createIndex({ routeId: 1, createdAt: -1 });

// TTL index for automatic deletion
db.logs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Error logs
db.logs.createIndex({ "error.phase": 1, createdAt: -1 });

// Cache hit/miss analytics
db.logs.createIndex({ "execution.cacheHit": 1, createdAt: -1 });
```

## Setup Instructions

### 1. Create MongoDB Atlas Cluster

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 Free tier works for development)
3. Configure network access (allow all IPs: 0.0.0.0/0 for Cloudflare Workers)
4. Create database user with read/write permissions

### 2. Enable Data API

Cloudflare Workers use the MongoDB Data API (HTTPS REST API) instead of direct connections:

1. In Atlas, go to **Data API** section
2. Enable the Data API
3. Create an API key
4. Copy the API URL (format: `https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1`)

### 3. Configure Environment Variables

Add these secrets to your Cloudflare Worker:

```bash
# Using Wrangler CLI
wrangler secret put MONGODB_API_URL
# Paste: https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1

wrangler secret put MONGODB_API_KEY
# Paste: your-api-key-here

wrangler secret put MONGODB_DATABASE
# Paste: toran
```

Or configure in `.dev.vars` for local development:

```env
MONGODB_API_URL=https://data.mongodb-api.com/app/<APP-ID>/endpoint/data/v1
MONGODB_API_KEY=your-api-key-here
MONGODB_DATABASE=toran
ENVIRONMENT=development
```

### 4. Initialize Collections and Indexes

Run this script using the MongoDB shell or driver:

```javascript
// Connect to MongoDB
use toran;

// Create collections
db.createCollection("gateways");
db.createCollection("routes");
db.createCollection("logs");

// Gateways indexes
db.gateways.createIndex({ subdomain: 1 }, { unique: true });
db.gateways.createIndex({ userId: 1 });
db.gateways.createIndex({ organizationId: 1 });
db.gateways.createIndex({ active: 1, subdomain: 1 });

// Routes indexes
db.routes.createIndex({ gatewayId: 1, priority: -1 });
db.routes.createIndex({ gatewayId: 1, path: 1, method: 1 });
db.routes.createIndex({ gatewayId: 1, active: 1, priority: -1 });
db.routes.createIndex({ tags: 1 });

// Logs indexes
db.logs.createIndex({ gatewayId: 1, createdAt: -1 });
db.logs.createIndex({ subdomain: 1, createdAt: -1 });
db.logs.createIndex({ routeId: 1, createdAt: -1 });
db.logs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.logs.createIndex({ "error.phase": 1, createdAt: -1 });
db.logs.createIndex({ "execution.cacheHit": 1, createdAt: -1 });

console.log("MongoDB setup complete!");
```

### 5. Seed Initial Data (Optional)

Create a test gateway and route:

```javascript
// Insert test gateway
const gateway = db.gateways.insertOne({
  subdomain: "test",
  name: "Test Gateway",
  description: "Development gateway for testing",
  baseUrl: "https://jsonplaceholder.typicode.com",
  active: true,
  variables: {
    BASE_URL: {
      value: "https://jsonplaceholder.typicode.com",
      description: "Test API base URL",
      secret: false
    }
  },
  defaults: {
    timeout: 30000,
    followRedirects: true,
    cacheEnabled: false,
    logLevel: "full"
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    totalRequests: 0,
    totalRoutes: 0,
    lastRequestAt: null
  }
});

// Insert test route
db.routes.insertOne({
  gatewayId: gateway.insertedId,
  path: "/posts/:id",
  method: ["GET"],
  priority: 100,
  active: true,
  destination: {
    type: "proxy",
    url: "${BASE_URL}/posts/${params.id}",
    preservePath: false
  },
  parameters: {
    id: {
      type: "number",
      required: true,
      description: "Post ID"
    }
  },
  preMutations: {
    headers: [],
    queryParams: [],
    body: []
  },
  postMutations: {
    headers: [],
    body: []
  },
  cache: {
    enabled: true,
    ttl: 300,
    varyBy: {
      path: true,
      method: true,
      queryParams: [],
      headers: [],
      body: false
    },
    conditions: {
      statusCodes: [200],
      maxBodySize: 10240
    }
  },
  name: "Get Post by ID",
  description: "Fetch a single post by ID from JSONPlaceholder",
  tags: ["posts", "test"],
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgDuration: 0,
    lastRequestAt: null
  }
});

console.log("Test data seeded!");
```

## Admin UI MongoDB Connection

The admin UI uses direct MongoDB connection (not Data API) for better query capabilities:

1. Get your MongoDB connection string from Atlas
2. Add to Cloudflare Pages environment variables:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toran?retryWrites=true&w=majority
   ```

3. The admin UI Cloudflare Functions will use this connection string

## Migration from Existing Mappings

If you have existing data in a `mappings` collection, use this migration script:

```javascript
// Migration script to convert mappings to gateways + routes
const mappings = db.mappings.find({}).toArray();

for (const mapping of mappings) {
  // Create gateway
  const gateway = db.gateways.insertOne({
    subdomain: mapping.subdomain,
    name: mapping.metadata.name,
    description: mapping.metadata.description,
    baseUrl: mapping.destinationUrl,
    active: mapping.active,
    variables: {},
    defaults: {
      timeout: 30000,
      followRedirects: true,
      cacheEnabled: false,
      logLevel: "full"
    },
    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
    stats: {
      totalRequests: mapping.stats.totalRequests,
      totalRoutes: 1,
      lastRequestAt: mapping.stats.lastRequestAt
    }
  });

  // Create default catch-all route
  db.routes.insertOne({
    gatewayId: gateway.insertedId,
    path: "/*",
    method: ["*"],
    priority: 0,
    active: true,
    destination: {
      type: "proxy",
      url: mapping.destinationUrl,
      preservePath: mapping.preservePath
    },
    parameters: {},
    preMutations: { headers: [], queryParams: [], body: [] },
    postMutations: { headers: [], body: [] },
    cache: null,
    name: "Default Route",
    description: `Migrated from mapping ${mapping._id}`,
    tags: mapping.metadata.tags,
    createdAt: mapping.createdAt,
    updatedAt: mapping.updatedAt,
    stats: {
      totalRequests: mapping.stats.totalRequests,
      cacheHits: 0,
      cacheMisses: 0,
      avgDuration: 0,
      lastRequestAt: mapping.stats.lastRequestAt
    }
  });
}

console.log(`Migrated ${mappings.length} mappings to gateways + routes`);
```

## Performance Considerations

1. **Config Caching**: Gateway configs are flattened and cached in Cloudflare KV for 1 hour to minimize MongoDB queries
2. **Log Batching**: Consider batching log writes in high-traffic scenarios
3. **Index Coverage**: Ensure all queries use indexes (check with `.explain()`)
4. **TTL Cleanup**: The TTL index on `logs.expiresAt` automatically deletes old logs after 30 days

## Monitoring

Monitor these metrics in MongoDB Atlas:

- Query performance (slow queries)
- Index usage
- Connection pool size
- Data API request rate
- Storage size (especially logs collection)

## Backup Strategy

1. Enable continuous backups in MongoDB Atlas (Oplog)
2. Schedule daily snapshots
3. Export critical gateway/route configs to git repository as backup

## Security

1. **Network Access**: Cloudflare Workers require 0.0.0.0/0 IP allowlist
2. **API Keys**: Rotate Data API keys regularly
3. **Secrets**: Use Cloudflare Workers secrets for sensitive variables
4. **Validation**: Validate all inputs before database writes
5. **Encryption**: Atlas encrypts data at rest and in transit by default

---

**Next Steps:**
1. Set up MongoDB Atlas cluster
2. Enable Data API and get credentials
3. Run index creation script
4. Configure Cloudflare Worker secrets
5. Test connection from worker
