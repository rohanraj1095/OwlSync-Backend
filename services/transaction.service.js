// import transactionRepository from "../repositories/transaction.repository.js";
// import { cacheGet, cacheSet, incrementCacheVersion } from "./cache.service.js";

// export class TransactionService {
//   async uploadBatch(userId, transactions) {
//     const txnIds = transactions.map(({ txnId }) => txnId);
//     const existingTxnIds = await transactionRepository.findExistingTxnIds(
//       userId,
//       txnIds,
//     );

//     const newTxns = transactions
//       .filter(({ txnId }) => !existingTxnIds.has(txnId))
//       .map((txn) => ({ ...txn, userId }));

//     if (newTxns.length > 0) {
//       await transactionRepository.insertMany(newTxns);
//       newTxns.forEach(({ txnId }) => {
//         cacheSet(`txn:${txnId}`, { txnId, status: "inserted" }, 3600);
//       });
//       await incrementCacheVersion(userId);
//     }

//     return {
//       inserted: newTxns.length,
//       duplicates: existingTxnIds.size,
//     };
//   }

//   async getUserTransactions(userId, page = 1, limit = 10, skipCache = false) {
//     const cacheKey = `transactions:${userId}:${page}:${limit}`;

//     if (!skipCache) {
//       const cached = await cacheGet(cacheKey);
//       if (cached) return cached;
//     }

//     const skip = (page - 1) * limit;
//     const transactions = await transactionRepository.findPaginated(
//       userId,
//       skip,
//       parseInt(limit),
//     );
//     const totalCount = await transactionRepository.countByUserId(userId);

//     const response = {
//       transactions,
//       totalPages: Math.ceil(totalCount / limit),
//       currentPage: parseInt(page),
//     };

//     if (!skipCache) {
//       await cacheSet(cacheKey, response, 18000);
//     }

//     return response;
//   }
// }

// export default new TransactionService();

import transactionRepository from "../repositories/transaction.repository.js";
import {
  cacheGet,
  cacheSet,
  incrementCacheVersion,
  getCacheVersion,
} from "./cache.service.js";

export class TransactionService {
  /**
   * Upload a batch of transactions and invalidate user cache
   */
  async uploadBatch(userId, transactions) {
    const txnIds = transactions.map(({ txnId }) => txnId);

    // 1. Find existing transaction IDs in DB to prevent duplicates
    const existingTxnIds = await transactionRepository.findExistingTxnIds(
      userId,
      txnIds,
    );

    // 2. Filter out duplicates and attach userId
    const newTxns = transactions
      .filter(({ txnId }) => !existingTxnIds.has(txnId))
      .map((txn) => ({ ...txn, userId }));

    // 3. Save new transactions and invalidate user cache
    if (newTxns.length > 0) {
      await transactionRepository.insertMany(newTxns);

      // Cache individual transaction statuses
      newTxns.forEach(({ txnId }) => {
        cacheSet(`txn:${txnId}`, { txnId, status: "inserted" }, 3600);
      });

      // Increment cache version so stale pagination lists are invalidated
      await incrementCacheVersion(userId);
    }

    return {
      inserted: newTxns.length,
      duplicates: existingTxnIds.size,
    };
  }

  /**
   * Get paginated transactions for a user (Supports cache bypass for "Sync Now")
   */
  async getUserTransactions(userId, page = 1, limit = 10, skipCache = false) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Fetch current cache version for user
    const version = await getCacheVersion(userId);
    const cacheKey = `transactions:${userId}:v${version}:${pageNum}:${limitNum}`;

    // 1. Try reading from Redis unless skipCache is true (Sync Now action)
    if (!skipCache) {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 2. Fetch fresh data from MongoDB
    const skip = (pageNum - 1) * limitNum;

    const [transactions, totalCount] = await Promise.all([
      transactionRepository.findPaginated(userId, skip, limitNum),
      transactionRepository.countByUserId(userId),
    ]);

    const response = {
      transactions,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
    };

    // 3. Store the fresh response back into Redis cache (TTL: 30 minutes)
    await cacheSet(cacheKey, response, 1800);

    return response;
  }
}

export default new TransactionService();
