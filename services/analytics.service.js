import transactionRepository from "../repositories/transaction.repository.js";
import { cacheGet, cacheSet } from "./cache.service.js";

export class AnalyticsService {
  categorizeTransaction(raw, type) {
    if (!raw) return type === "credited" ? "Income" : "Other";

    const rawLower = raw.toLowerCase();

    if (type === "credited") {
      if (rawLower.includes("sal") || rawLower.includes("salary"))
        return "Salary";
      if (rawLower.includes("refund") || rawLower.includes("cashback"))
        return "Refunds";
      if (rawLower.includes("freelance") || rawLower.includes("bonus"))
        return "Additional Income";
      if (rawLower.includes("reimbursement")) return "Reimbursements";
      if (rawLower.includes("interest") || rawLower.includes("dividend"))
        return "Investment Returns";
      return "Income";
    }

    if (
      rawLower.includes("food") ||
      rawLower.includes("restaurant") ||
      rawLower.includes("swiggy") ||
      rawLower.includes("zomato") ||
      rawLower.includes("dominos") ||
      rawLower.includes("mcdonalds") ||
      rawLower.includes("starbucks") ||
      rawLower.includes("coffee") ||
      rawLower.includes("cafe")
    )
      return "Food & Dining";

    if (
      rawLower.includes("grocery") ||
      rawLower.includes("bigbasket") ||
      rawLower.includes("blinkit") ||
      rawLower.includes("dmart") ||
      rawLower.includes("grofers") ||
      rawLower.includes("supermarket")
    )
      return "Groceries";

    if (
      rawLower.includes("uber") ||
      rawLower.includes("metro") ||
      rawLower.includes("taxi") ||
      rawLower.includes("fuel") ||
      rawLower.includes("petrol") ||
      rawLower.includes("ola") ||
      rawLower.includes("rapido")
    )
      return "Transportation";

    if (
      rawLower.includes("rent") ||
      rawLower.includes("electricity") ||
      rawLower.includes("internet") ||
      rawLower.includes("bill") ||
      rawLower.includes("water") ||
      rawLower.includes("gas") ||
      rawLower.includes("recharge")
    )
      return "Bills & Utilities";

    if (
      rawLower.includes("shopping") ||
      rawLower.includes("amazon") ||
      rawLower.includes("myntra") ||
      rawLower.includes("flipkart") ||
      rawLower.includes("ajio") ||
      rawLower.includes("meesho")
    )
      return "Shopping";

    if (
      rawLower.includes("netflix") ||
      rawLower.includes("movie") ||
      rawLower.includes("bookmyshow") ||
      rawLower.includes("spotify") ||
      rawLower.includes("youtube")
    )
      return "Entertainment";

    if (
      rawLower.includes("medical") ||
      rawLower.includes("pharmacy") ||
      rawLower.includes("apollo") ||
      rawLower.includes("hospital") ||
      rawLower.includes("doctor")
    )
      return "Healthcare";

    if (
      rawLower.includes("insurance") ||
      rawLower.includes("loan") ||
      rawLower.includes("emi") ||
      rawLower.includes("sip") ||
      rawLower.includes("mutual fund")
    )
      return "Financial Services";

    if (
      rawLower.includes("school") ||
      rawLower.includes("college") ||
      rawLower.includes("course") ||
      rawLower.includes("fees") ||
      rawLower.includes("tuition")
    )
      return "Education";

    if (rawLower.includes("atm") || rawLower.includes("withdraw"))
      return "Cash Withdrawal";

    return "Other Expenses";
  }

  getDateRange(period, customDate = null) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
        );
        break;

      case "thisweek": {
        const day = now.getDay();
        const diff = now.getDate() - day;
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;
      }

      case "last7days":
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;

      case "thismonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case "lastmonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;

      case "thisyear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;

      case "lastyear":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear(), 0, 1);
        break;

      case "custom":
        if (customDate && customDate.month && customDate.year) {
          startDate = new Date(customDate.year, customDate.month - 1, 1);
          endDate = new Date(customDate.year, customDate.month, 1);
        } else {
          throw new Error("Custom date requires month and year");
        }
        break;

      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    return { startDate, endDate };
  }

  calculateSpendingTrend(dailyStats) {
    const expenseStats = dailyStats.filter((day) => day.totalDebited > 0);

    if (expenseStats.length < 4) {
      return {
        direction: "insufficient_data",
        message: "Need more data to calculate spending trends",
        percentageChange: 0,
        firstHalfAverage: 0,
        secondHalfAverage: 0,
      };
    }

    const sortedStats = expenseStats.sort(
      (a, b) => new Date(a._id) - new Date(b._id),
    );
    const midPoint = Math.floor(sortedStats.length / 2);
    const firstHalf = sortedStats.slice(0, midPoint);
    const secondHalf = sortedStats.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, day) => sum + day.totalDebited, 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, day) => sum + day.totalDebited, 0) /
      secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;
    const percentageChange =
      firstHalfAvg > 0 ? (difference / firstHalfAvg) * 100 : 0;

    let direction, message;
    if (Math.abs(percentageChange) < 5) {
      direction = "stable";
      message = "Your spending is relatively stable";
    } else if (percentageChange > 0) {
      direction = "increasing";
      message = `Your spending is increasing by ${Math.round(percentageChange)}%`;
    } else {
      direction = "decreasing";
      message = `Your spending is decreasing by ${Math.round(Math.abs(percentageChange))}%`;
    }

    return {
      direction,
      message,
      percentageChange: Math.round(percentageChange * 100) / 100,
      firstHalfAverage: Math.round(firstHalfAvg * 100) / 100,
      secondHalfAverage: Math.round(secondHalfAvg * 100) / 100,
    };
  }

  async getTransactionStats(
    userId,
    period = "thismonth",
    customDate = null,
    skipCache = false,
  ) {
    const cacheKey = `txnStats:${userId}:${period}${customDate ? `:${JSON.stringify(customDate)}` : ""}`;

    if (!skipCache) {
      const cacheStats = await cacheGet(cacheKey);
      if (cacheStats) return cacheStats;
    }

    const { startDate, endDate } = this.getDateRange(period, customDate);
    const transactions = await transactionRepository.findInDateRange(
      userId,
      startDate,
      endDate,
    );

    if (transactions.length === 0) {
      const emptyResponse = {
        period,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        summary: {
          totalTransactions: 0,
          totalCredited: 0,
          totalDebited: 0,
          netBalance: 0,
          avgTransaction: 0,
        },
        categoryStats: [],
        dailyStats: [],
        trends: {
          direction: "no_data",
          message: "No transactions found for this period",
        },
        message: "No transaction found for this user in this specified period",
      };
      await cacheSet(cacheKey, emptyResponse, 60);
      return emptyResponse;
    }

    const categorizedMap = {};
    transactions.forEach((txn) => {
      const category = this.categorizeTransaction(txn.raw, txn.type);
      if (!categorizedMap[category]) {
        categorizedMap[category] = {
          category,
          totalAmount: 0,
          count: 0,
          type: txn.type,
        };
      }
      categorizedMap[category].totalAmount += txn.amount;
      categorizedMap[category].count += 1;
    });

    const categoryStats = Object.values(categorizedMap).sort(
      (a, b) => b.totalAmount - a.totalAmount,
    );

    const typeStats = await transactionRepository.aggregateByType(
      userId,
      startDate,
      endDate,
    );
    const dailyStats = await transactionRepository.aggregateDailyWithTypes(
      userId,
      startDate,
      endDate,
    );

    const creditedTotal =
      typeStats.find((t) => t._id === "credited")?.totalAmount || 0;
    const debitedTotal =
      typeStats.find((t) => t._id === "debited")?.totalAmount || 0;
    const netBalance = creditedTotal - debitedTotal;

    const trendAnalysis = this.calculateSpendingTrend(dailyStats);

    const topExpenseCategory =
      categoryStats.find((cat) => cat.type === "debited")?.category || "None";
    const savingsRate =
      creditedTotal > 0
        ? Math.round(((creditedTotal - debitedTotal) / creditedTotal) * 100)
        : 0;

    const highestSpendingDay = dailyStats.reduce(
      (max, day) => (day.totalDebited > max.totalDebited ? day : max),
      { totalDebited: 0, _id: null },
    );

    const avgDailySpending =
      dailyStats.length > 0
        ? Math.round((debitedTotal / dailyStats.length) * 100) / 100
        : 0;

    const response = {
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalTransactions: transactions.length,
        totalCredited: Math.round(creditedTotal * 100) / 100,
        totalDebited: Math.round(debitedTotal * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
        avgTransaction:
          Math.round(
            ((creditedTotal + debitedTotal) / transactions.length) * 100,
          ) / 100,
      },
      categoryStats: categoryStats.map((cat) => ({
        ...cat,
        totalAmount: Math.round(cat.totalAmount * 100) / 100,
        percentage:
          Math.round(
            (cat.totalAmount /
              (cat.type === "credited" ? creditedTotal : debitedTotal)) *
              100,
          ) || 0,
      })),
      typeBreakdown: typeStats.map((type) => ({
        type: type._id,
        totalAmount: Math.round(type.totalAmount * 100) / 100,
        count: type.count,
        avgTransaction: Math.round(type.avgTransaction * 100) / 100,
      })),
      dailyStats: dailyStats.map((day) => ({
        date: day._id,
        totalCredited: Math.round(day.totalCredited * 100) / 100,
        totalDebited: Math.round(day.totalDebited * 100) / 100,
        netFlow: Math.round((day.totalCredited - day.totalDebited) * 100) / 100,
        transactionsCount: day.transactionsCount,
      })),
      trends: trendAnalysis,
      insights: {
        topExpenseCategory,
        savingsRate,
        highestSpendingDay: {
          date: highestSpendingDay._id,
          amount: Math.round(highestSpendingDay.totalDebited * 100) / 100,
        },
        avgDailySpending,
        totalExpenseCategories: categoryStats.filter(
          (cat) => cat.type === "debited",
        ).length,
        totalIncomeCategories: categoryStats.filter(
          (cat) => cat.type === "credited",
        ).length,
        spendingConsistency:
          trendAnalysis.direction === "stable"
            ? "Consistent"
            : trendAnalysis.direction === "increasing"
              ? "Increasing"
              : "Decreasing",
      },
    };

    const cacheExpiry =
      period === "today"
        ? 300
        : period === "thisweek" || period === "last7days"
          ? 900
          : 3600;
    await cacheSet(cacheKey, response, cacheExpiry);
    return response;
  }

  async compareTransactionPeriods(
    userId,
    currentPeriod = "thismonth",
    previousPeriod = "lastmonth",
    skipCache = false,
  ) {
    const cacheKey = `txnCompare:${userId}:${currentPeriod}:${previousPeriod}`;

    if (!skipCache) {
      const cachedComparison = await cacheGet(cacheKey);
      if (cachedComparison) return cachedComparison;
    }

    const currentRange = this.getDateRange(currentPeriod);
    const currentStats = await transactionRepository.aggregateByType(
      userId,
      currentRange.startDate,
      currentRange.endDate,
    );

    const previousRange = this.getDateRange(previousPeriod);
    const previousStats = await transactionRepository.aggregateByType(
      userId,
      previousRange.startDate,
      previousRange.endDate,
    );

    const currentCredited =
      currentStats.find((s) => s._id === "credited")?.totalAmount || 0;
    const currentDebited =
      currentStats.find((s) => s._id === "debited")?.totalAmount || 0;
    const currentTotal = currentCredited + currentDebited;
    const currentTransactions = currentStats.reduce(
      (sum, s) => sum + s.count,
      0,
    );

    const previousCredited =
      previousStats.find((s) => s._id === "credited")?.totalAmount || 0;
    const previousDebited =
      previousStats.find((s) => s._id === "debited")?.totalAmount || 0;
    const previousTotal = previousCredited + previousDebited;
    const previousTransactions = previousStats.reduce(
      (sum, s) => sum + s.count,
      0,
    );

    const totalDifference = currentTotal - previousTotal;
    const totalPercentChange =
      previousTotal > 0 ? (totalDifference / previousTotal) * 100 : 0;

    const spendingDifference = currentDebited - previousDebited;
    const spendingPercentChange =
      previousDebited > 0 ? (spendingDifference / previousDebited) * 100 : 0;

    const incomeDifference = currentCredited - previousCredited;
    const incomePercentChange =
      previousCredited > 0 ? (incomeDifference / previousCredited) * 100 : 0;

    let spendingComparison =
      spendingDifference > 0
        ? `You spent ₹${Math.round(spendingDifference * 100) / 100} more (${Math.round(spendingPercentChange)}% increase)`
        : spendingDifference < 0
          ? `You spent ₹${Math.round(Math.abs(spendingDifference) * 100) / 100} less (${Math.round(Math.abs(spendingPercentChange))}% decrease)`
          : "Your spending remained the same";

    let incomeComparison =
      incomeDifference > 0
        ? `Your income increased by ₹${Math.round(incomeDifference * 100) / 100} (${Math.round(incomePercentChange)}% increase)`
        : incomeDifference < 0
          ? `Your income decreased by ₹${Math.round(Math.abs(incomeDifference) * 100) / 100} (${Math.round(Math.abs(incomePercentChange))}% decrease)`
          : "Your income remained the same";

    let overallComparison =
      totalDifference > 0
        ? `Overall activity increased by ₹${Math.round(totalDifference * 100) / 100} (${Math.round(totalPercentChange)}% increase)`
        : totalDifference < 0
          ? `Overall activity decreased by ₹${Math.round(Math.abs(totalDifference) * 100) / 100} (${Math.round(Math.abs(totalPercentChange))}% decrease)`
          : "Overall activity remained the same";

    const response = {
      currentPeriod: {
        name: currentPeriod,
        totalCredited: Math.round(currentCredited * 100) / 100,
        totalDebited: Math.round(currentDebited * 100) / 100,
        netBalance: Math.round((currentCredited - currentDebited) * 100) / 100,
        transactionCount: currentTransactions,
        averageTransaction:
          currentTransactions > 0
            ? Math.round((currentTotal / currentTransactions) * 100) / 100
            : 0,
      },
      previousPeriod: {
        name: previousPeriod,
        totalCredited: Math.round(previousCredited * 100) / 100,
        totalDebited: Math.round(previousDebited * 100) / 100,
        netBalance:
          Math.round((previousCredited - previousDebited) * 100) / 100,
        transactionCount: previousTransactions,
        averageTransaction:
          previousTransactions > 0
            ? Math.round((previousTotal / previousTransactions) * 100) / 100
            : 0,
      },
      comparison: {
        spending: {
          difference: Math.round(spendingDifference * 100) / 100,
          percentChange: Math.round(spendingPercentChange * 100) / 100,
          message: spendingComparison,
        },
        income: {
          difference: Math.round(incomeDifference * 100) / 100,
          percentChange: Math.round(incomePercentChange * 100) / 100,
          message: incomeComparison,
        },
        overall: {
          difference: Math.round(totalDifference * 100) / 100,
          percentChange: Math.round(totalPercentChange * 100) / 100,
          message: overallComparison,
        },
      },
    };

    await cacheSet(cacheKey, response, 60);
    return response;
  }

  async getSpendingPattern(userId, period = "last7days", skipCache = false) {
    const cacheKey = `txnPattern:${userId}:${period}`;

    if (!skipCache) {
      const cachedPattern = await cacheGet(cacheKey);
      if (cachedPattern) return cachedPattern;
    }

    const { startDate, endDate } = this.getDateRange(period);
    const dayPattern = await transactionRepository.aggregateDayOfWeekPattern(
      userId,
      startDate,
      endDate,
    );
    const hourPattern = await transactionRepository.aggregateHourlyPattern(
      userId,
      startDate,
      endDate,
    );

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayByDayBreakdown = dayNames.map((dayName, index) => {
      const dayData = dayPattern.find((d) => d._id === index + 1);
      return {
        day: dayName,
        totalSpent: dayData ? Math.round(dayData.totalSpent * 100) / 100 : 0,
        transactionCount: dayData ? dayData.transactionCount : 0,
        averagePerTransaction: dayData
          ? Math.round(dayData.avgPerTransaction * 100) / 100
          : 0,
      };
    });

    const peakHour = hourPattern.reduce(
      (max, current) => (current.totalSpent > max.totalSpent ? current : max),
      { totalSpent: 0, _id: 0 },
    );
    const highestSpendingDay = dayByDayBreakdown.reduce((max, current) =>
      current.totalSpent > max.totalSpent ? current : max,
    );
    const mostActiveDay = dayByDayBreakdown.reduce((max, current) =>
      current.transactionCount > max.transactionCount ? current : max,
    );

    const response = {
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      dayByDayBreakdown,
      hourlyPattern: hourPattern.map((hour) => ({
        hour: hour._id,
        totalSpent: Math.round(hour.totalSpent * 100) / 100,
        transactionCount: hour.transactionCount,
      })),
      insights: {
        highestSpendingDay: {
          day: highestSpendingDay.day,
          amount: highestSpendingDay.totalSpent,
          message: `You tend to spend most on ${highestSpendingDay.day}s`,
        },
        mostActiveDay: {
          day: mostActiveDay.day,
          transactions: mostActiveDay.transactionCount,
          message: `You make most transactions on ${mostActiveDay.day}s`,
        },
        peakSpendingHour: {
          hour: peakHour._id,
          amount: Math.round(peakHour.totalSpent * 100) / 100,
          message: `Your peak spending time is around ${peakHour._id}:00`,
        },
      },
    };

    await cacheSet(cacheKey, response, 60);
    return response;
  }

  async getAnalytics(userId, period = "thismonth", skipCache = false) {
    const cacheKey = `analytics:${userId}:${period}`;

    if (!skipCache) {
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;
    }

    const { startDate, endDate } = this.getDateRange(period);
    const transactions = await transactionRepository.findInDateRange(
      userId,
      startDate,
      endDate,
    );

    if (transactions.length === 0) {
      const emptyResponse = {
        summary: {
          netBalance: 0,
          totalTransactions: 0,
          avgTransaction: 0,
          totalCredited: 0,
          totalDebited: 0,
        },
        insights: { savingsRate: 0, highestSpendingDay: null },
        trends: {
          direction: "stable",
          percentageChange: 0,
          firstHalfAverage: 0,
          secondHalfAverage: 0,
        },
        dailyStats: [],
        categoryStats: [],
      };
      await cacheSet(cacheKey, emptyResponse, 60);
      return emptyResponse;
    }

    const totalCredited = transactions
      .filter((t) => t.type === "credited")
      .reduce((s, t) => s + t.amount, 0);
    const totalDebited = transactions
      .filter((t) => t.type === "debited")
      .reduce((s, t) => s + t.amount, 0);
    const netBalance = totalCredited - totalDebited;
    const totalTransactions = transactions.length;
    const avgTransaction =
      totalTransactions > 0
        ? Math.round(
            (transactions.reduce((s, t) => s + t.amount, 0) /
              totalTransactions) *
              100,
          ) / 100
        : 0;

    const dailyMap = {};
    transactions.forEach((t) => {
      const dateStr = t.date.toISOString().split("T")[0];
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          spent: 0,
          received: 0,
          transactions: 0,
          netFlow: 0,
        };
      }
      dailyMap[dateStr].transactions += 1;
      if (t.type === "debited") {
        dailyMap[dateStr].spent += t.amount;
        dailyMap[dateStr].netFlow -= t.amount;
      } else {
        dailyMap[dateStr].received += t.amount;
        dailyMap[dateStr].netFlow += t.amount;
      }
    });

    const dailyStats = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const categoryMap = {};
    transactions.forEach((t) => {
      const cat = this.categorizeTransaction(t.raw, t.type);
      if (!categoryMap[cat])
        categoryMap[cat] = { name: cat, amount: 0, count: 0 };
      categoryMap[cat].amount += t.amount;
      categoryMap[cat].count += 1;
    });

    const categoryStats = Object.values(categoryMap).sort(
      (a, b) => b.amount - a.amount,
    );
    const savingsRate =
      totalCredited > 0
        ? Math.round(((totalCredited - totalDebited) / totalCredited) * 100)
        : 0;
    const highestSpendingDay =
      [...dailyStats].sort((a, b) => b.spent - a.spent)[0] || null;

    const midIndex = Math.floor(dailyStats.length / 2);
    const firstHalf = dailyStats.slice(0, midIndex);
    const secondHalf = dailyStats.slice(midIndex);

    const firstHalfAvg =
      firstHalf.length > 0
        ? Math.round(
            (firstHalf.reduce((s, d) => s + d.spent, 0) / firstHalf.length) *
              100,
          ) / 100
        : 0;
    const secondHalfAvg =
      secondHalf.length > 0
        ? Math.round(
            (secondHalf.reduce((s, d) => s + d.spent, 0) / secondHalf.length) *
              100,
          ) / 100
        : 0;

    let direction = "stable";
    let percentageChange = 0;
    if (firstHalfAvg > 0) {
      const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      percentageChange = Math.abs(Math.round(change * 100) / 100);
      direction =
        change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable";
    }

    const response = {
      summary: {
        netBalance: Math.round(netBalance * 100) / 100,
        totalTransactions,
        avgTransaction,
        totalCredited: Math.round(totalCredited * 100) / 100,
        totalDebited: Math.round(totalDebited * 100) / 100,
      },
      insights: { savingsRate, highestSpendingDay },
      trends: {
        direction,
        percentageChange,
        firstHalfAverage: firstHalfAvg,
        secondHalfAverage: secondHalfAvg,
      },
      dailyStats,
      categoryStats,
    };

    const ttl =
      period === "today"
        ? 300
        : period === "thisweek" || period === "last7days"
          ? 900
          : 3600;
    await cacheSet(cacheKey, response, ttl);
    return response;
  }

  async getSyncStatus(userId) {
    const cacheKey = `syncStatus:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const latestTxn = await transactionRepository.findLatestTransaction(userId);
    const lastSync = latestTxn ? latestTxn.createdAt : null;

    const response = { status: lastSync ? "auto" : "idle", lastSync };
    await cacheSet(cacheKey, response, 60);
    return response;
  }
}

export default new AnalyticsService();
