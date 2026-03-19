/**
 * Client-side token bucket rate limiter for Gemini API calls.
 * Enforces a maximum of 15 requests per 60-second window,
 * matching the Gemini free-tier limit. Never fails silently.
 */

const MAX_REQUESTS = 15;
const WINDOW_MS = 60_000; // 1 minute

interface RateLimiterState {
  tokens: number;
  windowStart: number;
}

const state: RateLimiterState = {
  tokens: MAX_REQUESTS,
  windowStart: Date.now(),
};

/**
 * Attempts to consume one token from the bucket.
 * @returns `{ allowed: true }` or `{ allowed: false, retryInMs: number }`
 */
export function consumeToken(): { allowed: true } | { allowed: false; retryInMs: number } {
  const now = Date.now();

  // Reset window if elapsed
  if (now - state.windowStart >= WINDOW_MS) {
    state.tokens = MAX_REQUESTS;
    state.windowStart = now;
  }

  if (state.tokens > 0) {
    state.tokens -= 1;
    return { allowed: true };
  }

  const retryInMs = WINDOW_MS - (now - state.windowStart);
  return { allowed: false, retryInMs };
}

/**
 * Returns remaining tokens and seconds until window resets.
 */
export function getRateLimitStatus(): { remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const elapsed = now - state.windowStart;
  const resetInMs = Math.max(0, WINDOW_MS - elapsed);
  return {
    remaining: state.tokens,
    resetInSeconds: Math.ceil(resetInMs / 1000),
  };
}
