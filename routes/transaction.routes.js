import express from "express";
import {
  uploadTransactions,
  getUserTransactions,
} from "../controllers/transaction.controller.js";
import {
  getTransactionStats,
  getSpendingPattern,
  compareTransactionPeriods,
  getAnalytics,
  getSyncStatus,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.js";
import { addRateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/upload", authenticate, addRateLimit, uploadTransactions);
router.get("/get-data", authenticate, getUserTransactions);

router.get("/stats", authenticate, getTransactionStats);
router.get("/compare", authenticate, compareTransactionPeriods);
router.get("/pattern", authenticate, getSpendingPattern);
router.get("/analytics", authenticate, getAnalytics);
router.get("/sync-status", authenticate, getSyncStatus);

export default router;
