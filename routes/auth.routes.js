// import express from "express";
// import asyncHandler from "express-async-handler";
// import rateLimit from "express-rate-limit";
// import {
//   registerUser,
//   loginUser,
//   refreshToken,
//   logoutUser,
// } from "../controllers/auth.controller.js";

// const router = express.Router();

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 10,
// });

// router.post("/register", registerUser);
// router.post("/login", limiter, loginUser);
// router.post("/refresh-token", refreshToken);
// router.post("/logout", logoutUser);

// export default router;

import express from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  sendOTP,
  verifyOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

export default router;
