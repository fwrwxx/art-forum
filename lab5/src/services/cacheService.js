const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

class CacheService {
  async get(key) {
    return cache.get(key) || null;
  }

  async set(key, value, ttl = 300) {
    cache.set(key, value, ttl);
  }

  async del(key) {
    cache.del(key);
  }

  async delByPattern(pattern) {
    const keys = cache.keys();
    const regex = new RegExp(pattern.replace('*', '.*'));
    keys.forEach(key => {
      if (regex.test(key)) cache.del(key);
    });
  }
}

module.exports = new CacheService();