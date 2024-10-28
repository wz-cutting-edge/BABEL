class CacheService {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.maxSize = options.maxSize || 100; // Maximum cache entries
  }

  set(key, value, customTTL) {
    // Implement LRU cache eviction if needed
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const ttl = customTTL || this.ttl;
    const item = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };

    this.cache.set(key, item);
    
    // Schedule cleanup
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const cacheService = new CacheService();
