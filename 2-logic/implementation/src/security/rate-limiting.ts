// Rate Limiting Module
// Addresses DEBT-002: No Rate Limiting (DoS vulnerability)
// Threat Model references: T3.1 (Spam connections), T3.2 (Message flooding), T3.3 (Large payloads)

import { Socket } from 'socket.io';

/**
 * Security Decision: Token Bucket Algorithm
 *
 * We use a token bucket rate limiter because:
 * - Allows burst traffic (better UX for legitimate users)
 * - Simple to implement and understand
 * - Effective against DoS attacks
 * - Doesn't require external dependencies
 *
 * Alternative considered: Sliding window, but token bucket is simpler
 * and sufficient for our threat model (local network, casual game).
 */

interface RateLimitConfig {
  // Maximum tokens (requests) allowed
  maxTokens: number;
  // How many tokens regenerate per second
  refillRate: number;
  // What happens when limit is exceeded
  action: 'reject' | 'disconnect' | 'warn';
}

interface ClientBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * Rate Limiter for WebSocket events
 *
 * Security: Prevents DoS attacks via message flooding
 * Threat Model: T3.2 - Message Flooding
 */
export class SocketRateLimiter {
  private buckets: Map<string, ClientBucket> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Security: Configure rate limits for different event types
    // These values balance security with UX for a casual game

    // submitWord: Most expensive operation (dictionary lookup, validation)
    // Threat: Attacker spams word submissions to exhaust CPU
    this.configs.set('submitWord', {
      maxTokens: 10,        // Allow 10 rapid submissions
      refillRate: 2,        // Then 2 per second sustained
      action: 'reject',     // Just reject, don't disconnect (might be lag)
    });

    // passTurn: Less expensive but still should be limited
    this.configs.set('passTurn', {
      maxTokens: 5,
      refillRate: 1,
      action: 'reject',
    });

    // exchangeTiles: Moderate cost
    this.configs.set('exchangeTiles', {
      maxTokens: 5,
      refillRate: 1,
      action: 'reject',
    });

    // joinGame: Should be rare per client
    this.configs.set('joinGame', {
      maxTokens: 5,          // Allow retries for connection issues
      refillRate: 0.5,       // But very slow refill (30s per token)
      action: 'disconnect',  // Disconnect if exceeded (likely attack)
    });

    // startGame: Only host should do this once
    this.configs.set('startGame', {
      maxTokens: 3,
      refillRate: 0.2,       // 5 seconds per token
      action: 'reject',
    });

    // Security: Cleanup stale buckets every 5 minutes to prevent memory leak
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a request should be allowed
   *
   * Returns true if allowed, false if rate limited
   */
  public checkLimit(socketId: string, eventName: string): boolean {
    const config = this.configs.get(eventName);
    if (!config) {
      // Security: If no rate limit configured, allow by default
      // (We configure limits for sensitive operations only)
      return true;
    }

    // Get or create bucket for this client
    let bucket = this.buckets.get(`${socketId}:${eventName}`);
    if (!bucket) {
      bucket = {
        tokens: config.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(`${socketId}:${eventName}`, bucket);
    }

    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * config.refillRate;

    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have tokens available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get the action to take when rate limit is exceeded
   */
  public getAction(eventName: string): 'reject' | 'disconnect' | 'warn' {
    const config = this.configs.get(eventName);
    return config?.action || 'reject';
  }

  /**
   * Security: Cleanup old buckets to prevent memory leak
   * Threat: Attacker creates many connections to exhaust memory
   */
  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Remove all buckets for a socket (on disconnect)
   */
  public clearSocket(socketId: string): void {
    for (const key of this.buckets.keys()) {
      if (key.startsWith(socketId + ':')) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Rate Limiter for HTTP endpoints
 *
 * Security: Prevents DoS via HTTP request flooding
 * Simpler than socket rate limiter (no per-event configs)
 */
export class HttpRateLimiter {
  private buckets: Map<string, ClientBucket> = new Map();
  private config: RateLimitConfig;

  constructor(config?: Partial<RateLimitConfig>) {
    // Security: Default config for HTTP endpoints
    // More permissive than WebSocket because HTTP requests are cheaper
    this.config = {
      maxTokens: config?.maxTokens || 100,      // 100 burst
      refillRate: config?.refillRate || 10,     // 10 per second sustained
      action: config?.action || 'reject',
    };

    // Security: Cleanup stale buckets
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request from IP should be allowed
   */
  public checkLimit(identifier: string): boolean {
    let bucket = this.buckets.get(identifier);
    if (!bucket) {
      bucket = {
        tokens: this.config.maxTokens,
        lastRefill: Date.now(),
      };
      this.buckets.set(identifier, bucket);
    }

    // Refill tokens
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.config.refillRate;

    bucket.tokens = Math.min(this.config.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check tokens
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000;

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }
}

/**
 * Connection limiter - limits total simultaneous connections
 *
 * Security: Prevents resource exhaustion from connection spam
 * Threat Model: T3.1 - Spam Connection Attempts
 */
export class ConnectionLimiter {
  private connections: Map<string, number> = new Map();

  constructor(
    private maxConnectionsPerIP: number = 10,
    private maxTotalConnections: number = 100
  ) {}

  /**
   * Check if a new connection should be allowed
   */
  public allowConnection(identifier: string): boolean {
    // Security: Check total connections (global limit)
    const totalConnections = Array.from(this.connections.values())
      .reduce((sum, count) => sum + count, 0);

    if (totalConnections >= this.maxTotalConnections) {
      return false;
    }

    // Security: Check connections per identifier (IP-based limit)
    const current = this.connections.get(identifier) || 0;
    if (current >= this.maxConnectionsPerIP) {
      return false;
    }

    return true;
  }

  /**
   * Register a new connection
   */
  public addConnection(identifier: string): void {
    const current = this.connections.get(identifier) || 0;
    this.connections.set(identifier, current + 1);
  }

  /**
   * Unregister a connection
   */
  public removeConnection(identifier: string): void {
    const current = this.connections.get(identifier) || 0;
    if (current <= 1) {
      this.connections.delete(identifier);
    } else {
      this.connections.set(identifier, current - 1);
    }
  }
}

/**
 * Middleware factory for Express rate limiting
 */
export function createHttpRateLimitMiddleware(limiter: HttpRateLimiter) {
  return (req: any, res: any, next: any) => {
    // Security: Use IP address as identifier
    // In production, consider X-Forwarded-For if behind proxy
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';

    if (!limiter.checkLimit(identifier)) {
      // Security: Return 429 Too Many Requests (standard HTTP status)
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait before making more requests',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    next();
  };
}
