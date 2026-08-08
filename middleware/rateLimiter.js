import rateLimit from "express-rate-limit";

export const addRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000,
  message: { success: false, message: "Too many attempts! Try again later" },
  headers: true,
});
