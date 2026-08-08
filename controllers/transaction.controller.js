// import asyncHandler from "express-async-handler";
// import apiResponse from "../utils/apiResponse.js";
// import transactionService from "../services/transaction.service.js";
// import { validateTransactionBatch } from "../utils/validators.js";

// export const uploadTransactions = asyncHandler(async (req, res) => {
//   const { transactions } = req.body;
//   const { error } = validateTransactionBatch(transactions);
//   if (error)
//     return res.status(400).json(apiResponse(false, error.details[0].message));

//   const result = await transactionService.uploadBatch(
//     req.user.userId,
//     transactions,
//   );
//   res
//     .status(200)
//     .json(
//       apiResponse(true, `${result.inserted} new transaction(s) saved`, result),
//     );
// });

// export const getUserTransactions = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, skipCache } = req.query;
//   const data = await transactionService.getUserTransactions(
//     req.user.userId,
//     page,
//     limit,
//     skipCache === "true",
//   );
//   res.status(200).json(apiResponse(true, "Transaction retrieved.", data));
// });

import asyncHandler from "express-async-handler";
import apiResponse from "../utils/apiResponse.js";
import transactionService from "../services/transaction.service.js";
import { validateTransactionBatch } from "../utils/validators.js";

export const uploadTransactions = asyncHandler(async (req, res) => {
  const { transactions } = req.body;

  if (!transactions || !Array.isArray(transactions)) {
    return res
      .status(400)
      .json(apiResponse(false, "Transactions array is required."));
  }

  const { error } = validateTransactionBatch(transactions);
  if (error)
    return res.status(400).json(apiResponse(false, error.details[0].message));

  // FIX: Use req.user.id instead of req.user.userId
  const userId = req.user.id || req.user._id;

  const result = await transactionService.uploadBatch(userId, transactions);

  res
    .status(200)
    .json(
      apiResponse(true, `${result.inserted} new transaction(s) saved`, result),
    );
});

export const getUserTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, skipCache } = req.query;

  // FIX: Use req.user.id instead of req.user.userId
  const userId = req.user.id || req.user._id;

  const data = await transactionService.getUserTransactions(
    userId,
    page,
    limit,
    skipCache === "true",
  );

  res.status(200).json(apiResponse(true, "Transaction retrieved.", data));
});
