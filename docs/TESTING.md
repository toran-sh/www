# Toran API Gateway - Testing Guide

Comprehensive testing guide for validating your Toran deployment.

## Table of Contents

1. [Local Testing](#local-testing)
2. [Production Testing](#production-testing)
3. [Feature Testing](#feature-testing)
4. [Performance Testing](#performance-testing)
5. [Troubleshooting](#troubleshooting)

---

## Local Testing

### Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Set up local environment variables
cat > .dev.vars << EOF
MONGODB_API_URL=https://data.mongodb-api.com/app/your-app-id/endpoint/data/v1
MONGODB_API_KEY=your-api-key
MONGODB_DATABASE=toran
ENVIRONMENT=development
EOF
```

### Start Local Worker

```bash
# Start worker in development mode
npm run dev:worker

# Worker will be available at: http://localhost:8787
```

### Test Local Worker

```bash
# Test with subdomain query parameter (for localhost)
curl "http://localhost:8787/posts/1?subdomain=test"

# Expected response: JSON from JSONPlaceholder API
# Expected headers:
# X-Toran-Gateway: test
# X-Toran-Route: Get Post by ID
# X-Toran-Cache: MISS
```

---

## Production Testing

### 1. Gateway & Routing Tests

#### Test Gateway Resolution
```bash
# Test that subdomain resolves to correct gateway
curl -I https://test.toran.dev/posts/1

# Expected headers:
# HTTP/1.1 200 OK
# X-Toran-Gateway: test
# X-Toran-Route: Get Post by ID
```

#### Test Route Matching
```bash
# Test parameterized route
curl https://test.toran.dev/posts/1
# Should match: GET /posts/:id

# Test list route
curl https://test.toran.dev/posts
# Should match: GET /posts

# Test wildcard route
curl https://test.toran.dev/users/1
# Should match: * /users/*
```

#### Test Route Priority
```bash
# Higher priority routes should match first
# Create two routes with same path but different priorities
# The route with priority 100 should match before priority 90
```

### 2. Mutation Tests

#### Test Header Mutations (Pre-Request)
```bash
# Route should add X-Gateway header
curl https://test.toran.dev/posts/1 -v 2>&1 | grep "X-Gateway"

# Verify the mutation was applied in logs
```

#### Test Query Parameter Mutations
```bash
# List posts route adds _limit=10
curl https://test.toran.dev/posts

# Should return exactly 10 posts (mutation adds _limit query param)
```

#### Test Body Mutations
```bash
# Create post with body transformation
curl -X POST https://test.toran.dev/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": "This is the body",
    "authorId": 1
  }'

# Body should be transformed: content → body, authorId → userId
```

#### Test Response Mutations
```bash
# Check for added response headers
curl -I https://test.toran.dev/posts/1

# Should include:
# X-Cached-By: Toran (from post-mutation)
```

### 3. Caching Tests

#### Test Cache Miss
```bash
# First request - cache miss
curl -I https://test.toran.dev/posts/1

# Expected headers:
# X-Toran-Cache: MISS
# X-Toran-Route: Get Post by ID
```

#### Test Cache Hit
```bash
# Second request - should be cached
curl -I https://test.toran.dev/posts/1

# Expected headers:
# X-Toran-Cache: HIT
# X-Toran-Cache-Age: 2  (seconds since cached)
```

#### Test Cache Vary-By Path
```bash
# Different paths should have different cache entries
curl https://test.toran.dev/posts/1  # Cache entry 1
curl https://test.toran.dev/posts/2  # Cache entry 2 (different path)

# Each should miss on first request, hit on second
```

#### Test Cache Vary-By Query Params
```bash
# Routes configured to vary by query params
curl "https://test.toran.dev/posts?_limit=5"   # Cache entry 1
curl "https://test.toran.dev/posts?_limit=10"  # Cache entry 2

# Different cache entries despite same path
```

#### Test Cache TTL Expiration
```bash
# Route has 5-minute TTL
curl https://test.toran.dev/posts/1  # MISS
curl https://test.toran.dev/posts/1  # HIT

# Wait 6 minutes
sleep 360

curl https://test.toran.dev/posts/1  # MISS (cache expired)
```

#### Test Cache Invalidation
```bash
# Via Admin UI or API:
# POST /api/cache/invalidate/route/{routeId}

# After invalidation:
curl https://test.toran.dev/posts/1  # MISS (cache cleared)
```

### 4. Template Variables Tests

#### Test Parameter Substitution
```bash
# Route uses ${params.id} in destination URL
curl https://test.toran.dev/posts/123

# Should proxy to: BASE_URL/posts/123
```

#### Test Gateway Variables
```bash
# Route uses ${variables.API_KEY} in headers
curl https://test.toran.dev/posts/1 -v

# Request should include header from gateway variables
```

### 5. Error Handling Tests

#### Test Invalid Subdomain
```bash
# Subdomain doesn't exist
curl https://nonexistent.toran.dev/test

# Expected response:
# Status: 404
# Body: {"error": {"code": "GATEWAY_NOT_FOUND", ...}}
```

#### Test No Route Match
```bash
# No route matches the path
curl https://test.toran.dev/nonexistent-endpoint

# Expected response:
# Status: 404
# Body: {"error": {"code": "NO_ROUTE_MATCH", ...}}
```

#### Test Inactive Gateway
```bash
# Set gateway active = false in MongoDB
# Then test:
curl https://test.toran.dev/posts/1

# Expected: 404 Gateway not found or inactive
```

---

## Feature Testing

### 1. Test All Mutation Types

#### JSON Map Mutation
```javascript
// In MongoDB, create route with:
{
  "type": "json-map",
  "jsonMap": {
    "user.name": "userName",
    "user.email": "email"
  }
}

// Test request:
curl -X POST https://test.toran.dev/transform \
  -d '{"user": {"name": "John", "email": "john@example.com"}}'

// Expected transformed body:
// {"userName": "John", "email": "john@example.com"}
```

#### JSONPath Mutation
```javascript
// Route config:
{
  "type": "json-path",
  "jsonPath": {
    "expression": "$.users[*].name",
    "target": "names"
  }
}

// Test to verify array extraction works
```

#### Template Mutation
```javascript
// Route config:
{
  "type": "template",
  "template": "Hello ${body.name}, welcome to ${variables.APP_NAME}"
}

// Test template substitution
```

#### Function Mutation
```javascript
// Route config:
{
  "type": "function",
  "function": {
    "code": "return context.body.toUpperCase();",
    "timeout": 100
  }
}

// Test JavaScript execution (be cautious - basic implementation)
```

### 2. Test Conditional Mutations

#### Header Condition
```javascript
// Mutation only applies if Authorization header exists
{
  "type": "add",
  "key": "X-Authed",
  "value": "true",
  "condition": {
    "type": "header",
    "operator": "exists",
    "key": "Authorization"
  }
}

// Test with and without Authorization header
curl https://test.toran.dev/posts/1 -H "Authorization: Bearer token"
curl https://test.toran.dev/posts/1  # No auth header
```

---

## Performance Testing

### 1. Response Time Benchmarks

```bash
# Use Apache Bench for load testing
ab -n 1000 -c 10 https://test.toran.dev/posts/1

# Expected results:
# Cache MISS: ~100-200ms (includes proxy time)
# Cache HIT: <5ms (from KV cache)
```

### 2. Cache Performance

```bash
# First request (cache miss)
time curl https://test.toran.dev/posts/1 > /dev/null
# real: ~0.15s

# Second request (cache hit)
time curl https://test.toran.dev/posts/1 > /dev/null
# real: ~0.01s (15x faster!)
```

### 3. Mutation Overhead

```bash
# Test route with no mutations
time curl https://test.toran.dev/posts/1

# Test route with 5 mutations
time curl https://test.toran.dev/complex-route

# Compare timing difference
# Expected overhead: 5-20ms for mutations
```

---

## Monitoring & Observability

### 1. Check Logs in MongoDB

```javascript
// Query recent logs
db.logs.find({})
  .sort({createdAt: -1})
  .limit(10)
  .pretty()

// Verify log structure:
// - request details
// - response details
// - execution timing
// - mutations applied
// - cache hit/miss
```

### 2. Analyze Execution Timing

```javascript
// Find slow requests
db.logs.find({
  'execution.timing.duration': {$gt: 1000}  // > 1 second
}).sort({'execution.timing.duration': -1})

// Check timing breakdown
db.logs.aggregate([
  {$group: {
    _id: '$routeId',
    avgDuration: {$avg: '$execution.timing.duration'},
    avgProxy: {$avg: '$execution.timing.breakdown.proxy'},
    avgMutations: {$avg: {$add: [
      '$execution.timing.breakdown.preMutations',
      '$execution.timing.breakdown.postMutations'
    ]}}
  }}
])
```

### 3. Cache Hit Rate

```javascript
// Calculate cache hit rate
db.logs.aggregate([
  {$group: {
    _id: '$routeId',
    total: {$sum: 1},
    hits: {$sum: {$cond: ['$execution.cacheHit', 1, 0]}},
    misses: {$sum: {$cond: ['$execution.cacheHit', 0, 1]}}
  }},
  {$project: {
    total: 1,
    hits: 1,
    misses: 1,
    hitRate: {$multiply: [{$divide: ['$hits', '$total']}, 100]}
  }}
])
```

---

## Troubleshooting

### Common Issues

**Cache Not Working**
```bash
# Check route configuration
db.routes.findOne({_id: ObjectId("...")})

# Verify cache.enabled is true
# Check cache conditions are met
# Ensure KV namespace is configured
```

**Mutations Not Applied**
```bash
# Check logs for mutation count
db.logs.findOne({}, {
  'execution.mutationsApplied': 1
})

# If count is 0, check:
# - Mutation configuration in route
# - Conditional mutation rules
```

**Slow Response Times**
```bash
# Check timing breakdown in logs
# Identify bottleneck:
# - Routing: optimize regex patterns
# - Mutations: simplify transformation logic
# - Proxy: check destination server performance
# - Caching: verify cache is enabled
```

---

## Automated Testing Scripts

### Test All Endpoints
```bash
#!/bin/bash
# test-all.sh

echo "Testing Toran API Gateway..."

# Test gateway resolution
echo "1. Testing gateway resolution..."
curl -s -I https://test.toran.dev/posts/1 | grep "X-Toran-Gateway"

# Test caching
echo "2. Testing cache (first request - MISS)..."
curl -s -I https://test.toran.dev/posts/1 | grep "X-Toran-Cache: MISS"

echo "3. Testing cache (second request - HIT)..."
curl -s -I https://test.toran.dev/posts/1 | grep "X-Toran-Cache: HIT"

# Test mutations
echo "4. Testing mutations..."
curl -s -I https://test.toran.dev/posts/1 | grep "X-Gateway: Toran-Test"

echo "✅ All tests passed!"
```

---

**Next Steps:**
1. Run all tests against your deployment
2. Set up continuous monitoring
3. Create alerts for errors
4. Document any issues found

For production deployments, integrate these tests into your CI/CD pipeline.
