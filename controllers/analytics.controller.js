// import asyncHandler from "express-async-handler";
// import apiResponse from "../utils/apiResponse.js";
// import analyticsService from "../services/analytics.service.js";

// export const getTransactionStats = asyncHandler(async (req, res) => {
//   const { period, customDate, skipCache, timezone } = req.query;
//   const data = await analyticsService.getTransactionStats(
//     req.user.userId,
//     period,
//     customDate,
//     skipCache === "true",
//     timezone || "Asia/Kolkata",
//   );
//   res
//     .status(200)
//     .json(
//       apiResponse(true, "Transaction Analytics Retrieved Successfully", data),
//     );
// });

// export const compareTransactionPeriods = asyncHandler(async (req, res) => {
//   const { currentPeriod, previousPeriod, skipCache, timezone } = req.query;
//   const data = await analyticsService.compareTransactionPeriods(
//     req.user.userId,
//     currentPeriod,
//     previousPeriod,
//     skipCache === "true",
//     timezone || "Asia/Kolkata",
//   );
//   res.status(200).json(apiResponse(true, "Period comparison completed", data));
// });

// export const getSpendingPattern = asyncHandler(async (req, res) => {
//   const { period, skipCache, timezone } = req.query;
//   const data = await analyticsService.getSpendingPattern(
//     req.user.userId,
//     period,
//     skipCache === "true",
//     timezone || "Asia/Kolkata",
//   );
//   res
//     .status(200)
//     .json(apiResponse(true, "Spending pattern analysis completed", data));
// });

// export const getAnalytics = asyncHandler(async (req, res) => {
//   const { period, skipCache, timezone } = req.query;
//   const data = await analyticsService.getAnalytics(
//     req.user.userId,
//     period,
//     skipCache === "true",
//     timezone || "Asia/Kolkata",
//   );
//   res.status(200).json(apiResponse(true, "Analytics generated", data));
// });

// export const getSyncStatus = asyncHandler(async (req, res) => {
//   const data = await analyticsService.getSyncStatus(req.user.userId);
//   res.status(200).json(apiResponse(true, "Sync status retrieved", data));
// });

import asyncHandler from "express-async-handler";
import apiResponse from "../utils/apiResponse.js";
import analyticsService from "../services/analytics.service.js";

// Helper function to safely derive user ID from JWT payload
const getUserId = (req) => req.user?.id || req.user?._id || req.user?.userId;

export const getTransactionStats = asyncHandler(async (req, res) => {
  const { period, customDate, skipCache, timezone } = req.query;
  const userId = getUserId(req);

  const data = await analyticsService.getTransactionStats(
    userId,
    period,
    customDate,
    skipCache === "true",
    timezone || "Asia/Kolkata",
  );

  res
    .status(200)
    .json(
      apiResponse(true, "Transaction Analytics Retrieved Successfully", data),
    );
});

export const compareTransactionPeriods = asyncHandler(async (req, res) => {
  const { currentPeriod, previousPeriod, skipCache, timezone } = req.query;
  const userId = getUserId(req);

  const data = await analyticsService.compareTransactionPeriods(
    userId,
    currentPeriod,
    previousPeriod,
    skipCache === "true",
    timezone || "Asia/Kolkata",
  );

  res.status(200).json(apiResponse(true, "Period comparison completed", data));
});

export const getSpendingPattern = asyncHandler(async (req, res) => {
  const { period, skipCache, timezone } = req.query;
  const userId = getUserId(req);

  const data = await analyticsService.getSpendingPattern(
    userId,
    period,
    skipCache === "true",
    timezone || "Asia/Kolkata",
  );

  res
    .status(200)
    .json(apiResponse(true, "Spending pattern analysis completed", data));
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const { period, skipCache, timezone } = req.query;
  const userId = getUserId(req);

  const data = await analyticsService.getAnalytics(
    userId,
    period,
    skipCache === "true",
    timezone || "Asia/Kolkata",
  );

  res.status(200).json(apiResponse(true, "Analytics generated", data));
});

export const getSyncStatus = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const data = await analyticsService.getSyncStatus(userId);

  res.status(200).json(apiResponse(true, "Sync status retrieved", data));
});
