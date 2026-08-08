import { redisClient } from "./cache.service.js";

const BLACKLIST_PREFIX = "rt_blacklist:";

export const blacklistToken = async (token, ttlSeconds = 7 * 24 * 60 * 60) => {
  try {
    await redisClient.setex(
      `${BLACKLIST_PREFIX}${token}`,
      ttlSeconds,
      "revoked",
    );
  } catch (err) {
    console.error("Redis blacklist error:", err);
  }
};

export const isTokenBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`${BLACKLIST_PREFIX}${token}`);
    return result === "revoked";
  } catch (err) {
    console.error("Redis blacklist check error:", err);
    return false;
  }
};
