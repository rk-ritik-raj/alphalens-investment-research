/**
 * Lightweight in-memory TTL cache utility.
 */
class InMemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get value from cache if it exists and hasn't expired.
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache with a TTL in milliseconds.
   */
  set(key, value, ttlMs = 300000) { // Default TTL of 5 minutes
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Clear all items from the cache.
   */
  clear() {
    this.cache.clear();
  }
}

// Export singleton instance
module.exports = new InMemoryCache();
