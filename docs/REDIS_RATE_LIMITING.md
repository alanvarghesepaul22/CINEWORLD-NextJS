# Redis Distributed Rate Limiting Implementation

## 🚀 Overview

This implementation provides enterprise-grade distributed rate limiting using Redis with a sliding window algorithm. It's designed for production environments where multiple application instances need to share rate limiting state.

## 🏗️ Architecture

### Core Components

1. **RedisRateLimitManager**: Connection management and rate limiting logic
2. **Sliding Window Algorithm**: More accurate than fixed window rate limiting
3. **Lua Scripts**: Atomic operations to prevent race conditions
4. **Fallback Strategy**: In-memory rate limiting for development

### Key Features

- ✅ **Atomic Operations**: Uses Lua scripts for race-condition-free rate limiting
- ✅ **Connection Pooling**: Efficient Redis connection management
- ✅ **Auto-Reconnection**: Exponential backoff retry strategy
- ✅ **Health Monitoring**: Built-in health check endpoint
- ✅ **Graceful Degradation**: Fails securely on Redis errors
- ✅ **Environment Detection**: Auto-switches between dev/prod implementations

## 📊 Performance Characteristics

- **Latency**: Sub-millisecond rate limit checks
- **Throughput**: Handles thousands of requests per second
- **Memory Efficiency**: Sliding window with automatic cleanup
- **Scalability**: Horizontally scalable across multiple instances

## 🔧 Configuration

### Environment Variables

```bash
# Production (Redis required)
NODE_ENV=production
REDIS_URL=redis://username:password@host:port

# Or for Vercel KV
KV_URL=rediss://username:password@host:port

# Development (optional - uses in-memory fallback)
NODE_ENV=development
```

### Supported Redis Providers

- **Redis Cloud/Labs**: `redis://default:password@host:port`
- **Upstash**: `rediss://default:password@host:port`
- **Vercel KV**: `rediss://default:password@host:port`
- **Railway Redis**: `redis://default:password@host:port`
- **AWS ElastiCache**: `rediss://cluster-endpoint:port`

## 🛡️ Security Features

### Rate Limiting Strategy
- **5 requests per hour** per IP address
- **Sliding window algorithm** for accurate rate limiting
- **Fail-closed security**: Denies requests on Redis errors

### IP Validation
- Validates IPv4 and IPv6 addresses
- Handles proxy chains (x-forwarded-for, x-real-ip)
- Rejects private IPs in production environments

### Safe Error Logging
- No sensitive data in logs
- Structured logging with safe properties only
- Truncated stack traces for security

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```bash
# Check Redis health
curl "http://localhost:3000/api/ai-suggestions?health=true"
```

Response format:
```json
{
  "redis": {
    "healthy": true,
    "latency": 12
  },
  "timestamp": "2025-10-08T10:30:00.000Z",
  "environment": "production"
}
```

### Rate Limit Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1728345600

HTTP/1.1 429 Too Many Requests
Retry-After: 847
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1728345600
```

## 📈 Implementation Details

### Sliding Window Algorithm

The implementation uses Redis Sorted Sets (ZSET) to maintain a sliding window of requests:

```lua
-- Remove expired entries
redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window)

-- Count current requests
local current = redis.call('ZCARD', key)

-- Add new request if under limit
if current < limit then
  redis.call('ZADD', key, score, score)
end
```

### Connection Management

```typescript
class RedisRateLimitManager {
  - Automatic reconnection with exponential backoff
  - Connection pooling and reuse
  - Graceful shutdown handling
  - Health monitoring
}
```

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Storage | In-memory | Redis |
| Scalability | Single instance | Multi-instance |
| Persistence | No | Yes |
| Performance | Good | Excellent |

## 🚀 Usage Examples

### Basic Implementation
```typescript
// Check rate limit
const rateLimitResult = await checkRateLimit(clientIP);

if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { 
      status: 429,
      headers: {
        'Retry-After': retryAfterSeconds.toString()
      }
    }
  );
}
```

### Health Check Integration
```typescript
// Monitor Redis health
const health = await redisManager.healthCheck();
console.log(`Redis healthy: ${health.healthy}, latency: ${health.latency}ms`);
```

## 🔧 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check REDIS_URL environment variable
   - Verify Redis server is running
   - Check network connectivity

2. **Rate Limiting Not Working**
   - Ensure NODE_ENV=production for Redis
   - Verify Redis connection in health check
   - Check IP extraction logic

3. **High Latency**
   - Monitor Redis server performance
   - Check network latency to Redis
   - Consider Redis clustering for scale

### Debug Commands

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Monitor Redis commands
redis-cli -u $REDIS_URL monitor

# Check rate limit keys
redis-cli -u $REDIS_URL keys "rate_limit:ai_suggestions:*"
```

## 📦 Dependencies

- `redis`: ^5.8.3 - Official Redis client for Node.js
- `next`: ^15.0.0 - Next.js framework
- `ipaddr.js`: ^2.2.0 - IP address validation

## 🔮 Future Enhancements

- [ ] Rate limiting by user ID (authenticated users)
- [ ] Different rate limits for different endpoints
- [ ] Rate limiting analytics and reporting
- [ ] Dynamic rate limit adjustment
- [ ] Rate limiting by API key/token

## 📄 License

This implementation follows the project's license terms.