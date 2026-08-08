import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";

export class TransactionRepository {
  async findExistingTxnIds(userId, txnIds) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const existing = await Transaction.find({
      userId: userObjectId,
      txnId: { $in: txnIds },
    }).select("txnId");
    return new Set(existing.map((t) => t.txnId));
  }

  async insertMany(transactions) {
    return await Transaction.insertMany(transactions, { ordered: false });
  }

  async findPaginated(userId, skip, limit) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.find({ userId: userObjectId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByUserId(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.countDocuments({ userId: userObjectId });
  }

  async findInDateRange(userId, startDate, endDate) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.find({
      userId: userObjectId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: -1 });
  }

  async aggregateByType(userId, startDate, endDate) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgTransaction: { $avg: "$amount" },
        },
      },
    ]);
  }

  async aggregateDailyWithTypes(userId, startDate, endDate) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalCredited: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "credited"] }, "$totalAmount", 0],
            },
          },
          totalDebited: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "debited"] }, "$totalAmount", 0],
            },
          },
          transactionsCount: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async aggregateDayOfWeekPattern(userId, startDate, endDate) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate, $lt: endDate },
          type: "debited",
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$date" },
          totalSpent: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          avgPerTransaction: { $avg: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async aggregateHourlyPattern(userId, startDate, endDate) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: { $gte: startDate, $lt: endDate },
          type: "debited",
        },
      },
      {
        $group: {
          _id: { $hour: "$date" },
          totalSpent: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async findLatestTransaction(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    return await Transaction.findOne({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .select("createdAt");
  }
}

export default new TransactionRepository();
