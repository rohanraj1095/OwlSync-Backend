import asyncHandler from "express-async-handler";
import aiService from "../services/ai.service.js";
import transactionService from "../services/transaction.service.js";
import apiResponse from "../utils/apiResponse.js";

export const getAIInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { period = "thismonth", skipCache = "false" } = req.query;

  const insights = await aiService.getFinancialInsights(
    userId,
    period,
    skipCache === "true",
  );

  res
    .status(200)
    .json(apiResponse(true, "AI insights generated successfully", insights));
});

export const parseAndSaveSMS = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { smsList } = req.body;

  if (!smsList || (Array.isArray(smsList) && smsList.length === 0)) {
    return res
      .status(400)
      .json(apiResponse(false, "smsList array or string is required"));
  }

  const parsedTxns = await aiService.parseSMSLogs(smsList);

  if (!parsedTxns || parsedTxns.length === 0) {
    return res
      .status(422)
      .json(
        apiResponse(false, "Could not parse valid transactions from input"),
      );
  }

  const formattedTxns = parsedTxns.map((item, index) => ({
    userId,
    txnId: item.txnId || Date.now() + index,
    amount: Number(item.amount),
    type: item.type,
    bank: item.bank || "Unknown",
    raw: item.raw,
    date: new Date().toISOString(),
  }));

  const result = await transactionService.uploadBatch(userId, formattedTxns);

  res.status(200).json(
    apiResponse(true, "SMS parsed and transactions stored successfully", {
      parsedCount: parsedTxns.length,
      dbResult: result,
      transactions: parsedTxns,
    }),
  );
});
