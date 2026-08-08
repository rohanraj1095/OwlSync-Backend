import express from "express";
import {
  getAIInsights,
  parseAndSaveSMS,
} from "../controllers/ai.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/insights", authenticate, getAIInsights);
router.post("/parse-sms", authenticate, parseAndSaveSMS);

export default router;
