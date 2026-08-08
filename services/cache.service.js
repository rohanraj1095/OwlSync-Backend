import Redis from "ioredis";

// const client = new Redis({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
// });

const client = new Redis(process.env.REDIS_URL);

export const redisClient = client;

export const cacheGet = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error: ${err.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, expiry = 60) => {
  try {
    await client.setex(key, expiry, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis SET error: ${err.message}`);
  }
};

export const getCacheVersion = async (userId) => {
  const key = `user:cacheVersion:${userId}`;
  const version = await client.get(key);
  return version ? parseInt(version, 10) : 0;
};

export const incrementCacheVersion = async (userId) => {
  const key = `user:cacheVersion:${userId}`;
  return await client.incr(key);
};
