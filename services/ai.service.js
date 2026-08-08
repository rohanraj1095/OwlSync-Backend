// import Groq from "groq-sdk";
// import transactionRepository from "../repositories/transaction.repository.js";
// import { cacheGet, cacheSet } from "./cache.service.js";
// import { getDateRange } from "../utils/date.util.js";

// class AIService {
//   constructor() {
//     this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//     this.model = "llama-3.3-70b-versatile";
//   }

//   /**
//    * Generates deep-dive granular financial intelligence and auditing
//    * Now includes:
//    * - Period-over-period comparison
//    * - Behavioral patterns
//    * - Financial freedom score
//    * - Emergency fund health assessment
//    * - Category trend analysis
//    */
//   async getFinancialInsights(userId, period = "thismonth", skipCache = false) {
//     const cacheKey = `ai_insights_v4:${userId}:${period}`;

//     if (!skipCache) {
//       const cached = await cacheGet(cacheKey);
//       if (cached) return cached;
//     }

//     const { startDate, endDate } = getDateRange(period);
//     const transactions = await transactionRepository.findInDateRange(
//       userId,
//       startDate,
//       endDate,
//     );

//     if (!transactions || transactions.length === 0) {
//       return {
//         summary: "No transactions recorded for this period.",
//         financialHealthScore: 100,
//         financialFreedomScore: 0,
//         riskAreas: [],
//         recommendations: [],
//         metrics: {
//           totalDebited: 0,
//           totalCredited: 0,
//           netSavings: 0,
//           savingsRatePercentage: 0,
//           averageDailySpend: 0,
//           discretionarySpendRatio: 0,
//         },
//         merchantAnalytics: [],
//         categoryBreakdown: [],
//         cashFlowVelocity: {},
//         anomalies: [],
//         essentialVsDiscretionary: {},
//         recurringSubscriptions: [],
//         spendingForecast: {},
//         taxDeductions: {},
//         suggestedBudgets: [],
//         behavioralInsights: {},
//         periodComparison: {},
//         emergencyFundAdvice: null,
//       };
//     }

//     // --- 1. PRE-COMPUTE EXTENSIVE FINANCIAL DATA ---
//     let totalDebited = 0;
//     let totalCredited = 0;
//     const categoryTotals = {};
//     const merchantTotals = {};
//     const dailyTotals = {};
//     const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
//     const hourlyTotals = Array(24).fill(0);
//     const transactionAmounts = [];

//     const cleanPayload = transactions.map((t) => {
//       const amt = Number(t.amount) || 0;
//       const dateObj = new Date(t.date);
//       const dateStr = dateObj.toISOString().split("T")[0];
//       const dayOfWeek = dateObj.getDay(); // 0=Sun
//       const hour = dateObj.getHours();

//       transactionAmounts.push(amt);

//       if (t.type === "debited") {
//         totalDebited += amt;

//         const cat = t.category || "Other";
//         categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

//         dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + amt;
//         dayOfWeekTotals[dayOfWeek] += amt;
//         hourlyTotals[hour] += amt;

//         const merchant = t.merchant || t.bank || "General/Other";
//         if (!merchantTotals[merchant]) {
//           merchantTotals[merchant] = { totalSpent: 0, transactionCount: 0 };
//         }
//         merchantTotals[merchant].totalSpent += amt;
//         merchantTotals[merchant].transactionCount += 1;
//       } else if (t.type === "credited") {
//         totalCredited += amt;
//       }

//       return {
//         amount: amt,
//         type: t.type,
//         bank: t.bank || "N/A",
//         merchant: t.merchant || "N/A",
//         category: t.category || "Other",
//         raw: t.raw || "N/A",
//         date: dateStr,
//         dayOfWeek,
//         hour,
//       };
//     });

//     const netSavings = totalCredited - totalDebited;
//     const savingsRate =
//       totalCredited > 0 ? (netSavings / totalCredited) * 100 : 0;

//     const uniqueDates = Object.keys(dailyTotals);
//     const totalDaysTracked = uniqueDates.length || 1;
//     const avgDailySpend = totalDebited / totalDaysTracked;

//     // --- 2. ADDITIONAL METRICS ---
//     // Category growth (compared to previous period)
//     let previousCategoryTotals = {};
//     try {
//       const prevStart = new Date(startDate);
//       const prevEnd = new Date(endDate);
//       const duration = prevEnd - prevStart;
//       prevStart.setTime(prevStart.getTime() - duration);
//       prevEnd.setTime(prevEnd.getTime() - duration);
//       const prevTxns = await transactionRepository.findInDateRange(
//         userId,
//         prevStart,
//         prevEnd,
//       );
//       prevTxns.forEach((t) => {
//         if (t.type === "debited") {
//           const cat = t.category || "Other";
//           previousCategoryTotals[cat] =
//             (previousCategoryTotals[cat] || 0) + t.amount;
//         }
//       });
//     } catch (e) {
//       /* ignore */
//     }

//     // Top merchants
//     const topMerchants = Object.entries(merchantTotals)
//       .map(([merchant, stats]) => ({ merchant, ...stats }))
//       .sort((a, b) => b.totalSpent - a.totalSpent)
//       .slice(0, 10);

//     // Day-of-week patterns
//     const dayNames = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     const dayPattern = dayOfWeekTotals.map((amount, i) => ({
//       day: dayNames[i],
//       amount: Math.round(amount * 100) / 100,
//       percentage: totalDebited > 0 ? (amount / totalDebited) * 100 : 0,
//     }));

//     // Hourly pattern (peak hours)
//     const hourlyPattern = hourlyTotals
//       .map((amount, i) => ({
//         hour: i,
//         amount: Math.round(amount * 100) / 100,
//       }))
//       .filter((h) => h.amount > 0);

//     // Stats on transaction amounts
//     const sortedAmounts = [...transactionAmounts].sort((a, b) => a - b);
//     const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)] || 0;
//     const avgTransaction =
//       transactionAmounts.length > 0
//         ? transactionAmounts.reduce((a, b) => a + b, 0) /
//           transactionAmounts.length
//         : 0;
//     const maxTransaction = Math.max(...transactionAmounts, 0);

//     // --- 3. BUILD COMPREHENSIVE PROMPT WITH RICH CONTEXT ---
//     // --- 3. BUILD COMPREHENSIVE PROMPT WITH RICH CONTEXT ---
//     const prompt = `
//       You are an elite AI financial auditor, certified by the Global Financial Intelligence Board.
//       You are analyzing a user's entire expense dataset for period: "${period}".

//       ## PRE-COMPUTED CORE METRICS (100% accurate, do not recalculate)
//       - Total Debited (Expenses): ${totalDebited}
//       - Total Credited (Income): ${totalCredited}
//       - Net Savings: ${netSavings}
//       - Savings Rate: ${savingsRate.toFixed(1)}%
//       - Tracked Active Days: ${totalDaysTracked}
//       - Avg Daily Burn Rate: ${avgDailySpend.toFixed(2)}
//       - Median Transaction Amount: ${median.toFixed(2)}
//       - Average Transaction Amount: ${avgTransaction.toFixed(2)}
//       - Largest Single Transaction: ${maxTransaction.toFixed(2)}

//       ## CATEGORY BREAKDOWN (current period)
//       ${JSON.stringify(categoryTotals, null, 2)}

//       ## CATEGORY GROWTH vs PREVIOUS PERIOD (if available)
//       ${Object.keys(previousCategoryTotals).length ? JSON.stringify(previousCategoryTotals, null, 2) : "No previous data."}

//       ## TOP MERCHANTS (by total spend)
//       ${JSON.stringify(topMerchants, null, 2)}

//       ## DAILY SPENDING PATTERN
//       Total days: ${totalDaysTracked}
//       Daily amounts: ${JSON.stringify(dailyTotals, null, 2)}

//       ## DAY-OF-WEEK SPENDING
//       ${JSON.stringify(dayPattern, null, 2)}

//       ## HOURLY SPENDING (peak hours)
//       ${JSON.stringify(hourlyPattern, null, 2)}

//       ## RAW TRANSACTIONS (sample up to 50 for context)
//       ${JSON.stringify(cleanPayload.slice(0, 50), null, 2)}

//       ## TASK: Produce an exhaustive, highly detailed financial audit.
//       Your response must be a valid JSON object following the exact schema below.
//       Do not add extra fields beyond the schema. Provide deep, actionable insights.

//       {
//         "summary": "Concise, highly actionable executive summary (maximum 2-3 sentences) synthesizing overall spending behavior, cash flow safety, and primary risk factors.",
//         "financialHealthScore": number (0-100, based on savings rate, expense control, and volatility),
//         "financialFreedomScore": number (0-100, a holistic score incorporating savings rate, discretionary spend ratio, and emergency fund readiness estimated from net savings vs average monthly expenses),
//         "behavioralInsights": {
//           "spendingPersonality": "e.g., 'Conscious Spender', 'Impulse Buyer', 'Frugal Saver'",
//           "emotionalTriggers": ["Identifies patterns like stress spending, weekend splurges, etc."],
//           "suggestedHabitChanges": ["Specific behavioral changes to improve financial health"]
//         },
//         "riskAreas": [
//           "List specific high-risk habits, overspending channels, or liquidity risks. Include magnitude and potential impact."
//         ],
//         "recommendations": [
//           "Actionable steps to cut wasteful spending and increase savings. Prioritize by impact."
//         ],
//         "essentialVsDiscretionary": {
//           "essentialAmount": number (Needs: Rent, Bills, Utilities, Health, Groceries),
//           "discretionaryAmount": number (Wants: Dining, Entertainment, Shopping, Subscriptions, etc.),
//           "discretionaryRatioPercentage": number (percentage of total debit that went to Wants)
//         },
//         "merchantAnalytics": [
//           { "merchant": "string", "totalSpent": number, "count": number, "shareOfTotalExpense": number, "insight": "Brief evaluation of this merchant's impact on your finances." }
//         ],
//         "categoryBreakdown": [
//           { "category": "string", "amount": number, "percentage": number, "insight": "Observation, trend, and recommendation for this category." }
//         ],
//         "categoryTrends": [
//           { "category": "string", "previousAmount": number, "currentAmount": number, "percentChange": number, "trendDirection": "up|down|stable", "analysis": "Detailed insight." }
//         ],
//         "cashFlowVelocity": {
//           "avgDailySpend": number,
//           "peakSpendingDay": { "date": "string", "amount": number },
//           "projectedMonthEndExpense": number,
//           "cashFlowStability": "e.g., 'High volatility', 'Stable', 'Improving'"
//         },
//         "anomalies": [
//           { "date": "string", "amount": number, "description": "string", "reason": "Why this single debit stands out as an anomaly", "severity": "low|medium|high" }
//         ],
//         "recurringSubscriptions": [
//           { "merchant": "string", "estimatedMonthlyCost": number, "flaggedReason": "e.g., Implicit monthly recurring bill or digital service", "actionSuggestion": "Keep, Cancel, or Reduce?" }
//         ],
//         "spendingForecast": {
//           "predictedNextMonthExpense": number,
//           "highestRiskCategory": "string",
//           "forecastExplanation": "Brief justification based on trends and seasonality."
//         },
//         "taxDeductions": {
//           "estimatedDeductibleExpenses": number,
//           "potentialCategories": ["Health", "Investments", "Bills"],
//           "note": "Brief tax optimization tip based on recorded debits."
//         },
//         "suggestedBudgets": [
//           { "category": "string", "currentSpending": number, "recommendedCap": number, "potentialMonthlySavings": number }
//         ],
//         "emergencyFundAdvice": {
//           "monthsOfExpensesCovered": number (estimated net savings / avg monthly expenses),
//           "recommendedMonths": 6,
//           "gap": number,
//           "strategy": "How to build or maintain emergency fund."
//         },
//         "periodComparison": {
//           "previousPeriod": "string",
//           "totalSpentChangePercent": number,
//           "totalIncomeChangePercent": number,
//           "topCategoryChange": "string",
//           "overallAssessment": "string"
//         }
//       }

//       Ensure all numbers are rounded to 2 decimal places where applicable.
//       Provide actionable, personalized advice. Be specific and constructive.
//     `;
//     const completion = await this.groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: this.model,
//       response_format: { type: "json_object" },
//       temperature: 0.3, // slightly lower for consistency
//     });

//     const aiInsights = JSON.parse(completion.choices[0].message.content);

//     // Merge deterministic metrics
//     const responseData = {
//       metrics: {
//         totalDebited,
//         totalCredited,
//         netSavings,
//         savingsRatePercentage: Number(savingsRate.toFixed(1)),
//         totalDaysTracked,
//         averageDailySpend: Number(avgDailySpend.toFixed(2)),
//         medianTransaction: Number(median.toFixed(2)),
//         avgTransaction: Number(avgTransaction.toFixed(2)),
//         maxTransaction: Number(maxTransaction.toFixed(2)),
//         topMerchantCount: topMerchants.length,
//       },
//       ...aiInsights,
//       // Ensure some fields are always present
//       financialHealthScore: aiInsights.financialHealthScore ?? 50,
//       financialFreedomScore: aiInsights.financialFreedomScore ?? 30,
//     };

//     await cacheSet(cacheKey, responseData, 3600);
//     return responseData;
//   }

//   /**
//    * Enhanced NLP Parser for Bank / UPI / Credit Card SMS logs
//    * Now returns more fields and confidence scores.
//    */
//   async parseSMSLogs(smsEntries) {
//     const logArray = Array.isArray(smsEntries) ? smsEntries : [smsEntries];

//     if (logArray.length === 0) {
//       return [];
//     }

//     const prompt = `
//       You are an expert NLP parser for UPI, Bank, and Credit Card SMS messages (e.g., HDFC, ICICI, SBI, Axis, Paytm, PhonePe, Cred).
//       Extract deep structured metadata from these raw SMS messages:
//       ${JSON.stringify(logArray)}

//       For each SMS, extract:
//       - txnId: Reference/UPI/Txn ID number if available (else null).
//       - amount: Numeric debit/credit value.
//       - type: "debited" or "credited".
//       - bank: Short bank or issuer name (e.g., "HDFC", "SBI", "Paytm").
//       - merchant: Clean merchant name or recipient name (e.g., "Swiggy", "Amazon", "Uber", "Zomato", "Electricity Board", "Peer Transfer").
//       - paymentChannel: "UPI" | "Card" | "NetBanking" | "ATM" | "Wallet" | "Other".
//       - category: "Food & Dining" | "Shopping" | "Bills & Utilities" | "Entertainment" | "Health" | "Investments" | "Salary" | "Transfers" | "Other".
//       - confidenceScore: Value between 0.0 and 1.0 based on message clarity.
//       - raw: Original SMS text.
//       - timestamp: Extract date/time if present (ISO string), else null.
//       - isInternational: true/false if merchant suggests foreign transaction.
//       - additionalNotes: Any other relevant info (e.g., balance, fees).

//       Respond ONLY with a raw JSON object matching this schema:
//       {
//         "transactions": [
//           {
//             "txnId": string | null,
//             "amount": number,
//             "type": "debited" | "credited",
//             "bank": string,
//             "merchant": string,
//             "paymentChannel": string,
//             "category": string,
//             "confidenceScore": number,
//             "raw": string,
//             "timestamp": string | null,
//             "isInternational": boolean,
//             "additionalNotes": string | null
//           }
//         ]
//       }
//     `;

//     const completion = await this.groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: this.model,
//       response_format: { type: "json_object" },
//       temperature: 0.1,
//     });

//     const result = JSON.parse(completion.choices[0].message.content);
//     return result.transactions || result;
//   }
// }

// export default new AIService();

import Groq from "groq-sdk";
import transactionRepository from "../repositories/transaction.repository.js";
import { cacheGet, cacheSet } from "./cache.service.js";
import { getDateRange } from "../utils/date.util.js";

class AIService {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.model = "llama-3.3-70b-versatile";
  }

  /**
   * Generates deep-dive granular financial intelligence and auditing
   */
  async getFinancialInsights(userId, period = "thismonth", skipCache = false) {
    const cacheKey = `ai_insights_v4:${userId}:${period}`;

    if (!skipCache) {
      const cached = await cacheGet(cacheKey);
      if (cached) return cached;
    }

    const { startDate, endDate } = getDateRange(period);
    const transactions = await transactionRepository.findInDateRange(
      userId,
      startDate,
      endDate,
    );

    if (!transactions || transactions.length === 0) {
      return {
        summary: ["No transactions recorded for this period."],
        financialHealthScore: 100,
        financialFreedomScore: 0,
        riskAreas: [],
        recommendations: [],
        metrics: {
          totalDebited: 0,
          totalCredited: 0,
          netSavings: 0,
          savingsRatePercentage: 0,
          averageDailySpend: 0,
          discretionarySpendRatio: 0,
        },
        merchantAnalytics: [],
        categoryBreakdown: [],
        cashFlowVelocity: {},
        anomalies: [],
        essentialVsDiscretionary: {},
        recurringSubscriptions: [],
        spendingForecast: {},
        taxDeductions: {},
        suggestedBudgets: [],
        behavioralInsights: {},
        periodComparison: {},
        emergencyFundAdvice: null,
      };
    }

    // --- 1. PRE-COMPUTE EXTENSIVE FINANCIAL DATA ---
    let totalDebited = 0;
    let totalCredited = 0;
    const categoryTotals = {};
    const merchantTotals = {};
    const dailyTotals = {};
    const dayOfWeekTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const hourlyTotals = Array(24).fill(0);
    const transactionAmounts = [];

    const cleanPayload = transactions.map((t) => {
      const amt = Number(t.amount) || 0;
      const dateObj = new Date(t.date);
      const dateStr = dateObj.toISOString().split("T")[0];
      const dayOfWeek = dateObj.getDay(); // 0=Sun
      const hour = dateObj.getHours();

      transactionAmounts.push(amt);

      if (t.type === "debited") {
        totalDebited += amt;

        const cat = t.category || "Other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

        dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + amt;
        dayOfWeekTotals[dayOfWeek] += amt;
        hourlyTotals[hour] += amt;

        const merchant = t.merchant || t.bank || "General/Other";
        if (!merchantTotals[merchant]) {
          merchantTotals[merchant] = { totalSpent: 0, transactionCount: 0 };
        }
        merchantTotals[merchant].totalSpent += amt;
        merchantTotals[merchant].transactionCount += 1;
      } else if (t.type === "credited") {
        totalCredited += amt;
      }

      return {
        amount: amt,
        type: t.type,
        bank: t.bank || "N/A",
        merchant: t.merchant || "N/A",
        category: t.category || "Other",
        raw: t.raw || "N/A",
        date: dateStr,
        dayOfWeek,
        hour,
      };
    });

    const netSavings = totalCredited - totalDebited;
    const savingsRate =
      totalCredited > 0 ? (netSavings / totalCredited) * 100 : 0;

    const uniqueDates = Object.keys(dailyTotals);
    const totalDaysTracked = uniqueDates.length || 1;
    const avgDailySpend = totalDebited / totalDaysTracked;

    // --- 2. ADDITIONAL METRICS ---
    let previousCategoryTotals = {};
    try {
      const prevStart = new Date(startDate);
      const prevEnd = new Date(endDate);
      const duration = prevEnd - prevStart;
      prevStart.setTime(prevStart.getTime() - duration);
      prevEnd.setTime(prevEnd.getTime() - duration);
      const prevTxns = await transactionRepository.findInDateRange(
        userId,
        prevStart,
        prevEnd,
      );
      prevTxns.forEach((t) => {
        if (t.type === "debited") {
          const cat = t.category || "Other";
          previousCategoryTotals[cat] =
            (previousCategoryTotals[cat] || 0) + t.amount;
        }
      });
    } catch (e) {
      /* ignore */
    }

    // Top merchants
    const topMerchants = Object.entries(merchantTotals)
      .map(([merchant, stats]) => ({ merchant, ...stats }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Day-of-week patterns
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayPattern = dayOfWeekTotals.map((amount, i) => ({
      day: dayNames[i],
      amount: Math.round(amount * 100) / 100,
      percentage: totalDebited > 0 ? (amount / totalDebited) * 100 : 0,
    }));

    // Hourly pattern
    const hourlyPattern = hourlyTotals
      .map((amount, i) => ({
        hour: i,
        amount: Math.round(amount * 100) / 100,
      }))
      .filter((h) => h.amount > 0);

    // Transaction stats
    const sortedAmounts = [...transactionAmounts].sort((a, b) => a - b);
    const median = sortedAmounts[Math.floor(sortedAmounts.length / 2)] || 0;
    const avgTransaction =
      transactionAmounts.length > 0
        ? transactionAmounts.reduce((a, b) => a + b, 0) /
          transactionAmounts.length
        : 0;
    const maxTransaction = Math.max(...transactionAmounts, 0);

    // --- 3. BUILD COMPREHENSIVE PROMPT WITH RICH CONTEXT ---
    const prompt = `
      You are an elite AI financial auditor. Analyze this user's entire expense dataset for period: "${period}".

      ## PRE-COMPUTED CORE METRICS
      - Total Debited (Expenses): ${totalDebited}
      - Total Credited (Income): ${totalCredited}
      - Net Savings: ${netSavings}
      - Savings Rate: ${savingsRate.toFixed(1)}%
      - Tracked Active Days: ${totalDaysTracked}
      - Avg Daily Burn Rate: ${avgDailySpend.toFixed(2)}
      - Median Transaction Amount: ${median.toFixed(2)}
      - Average Transaction Amount: ${avgTransaction.toFixed(2)}
      - Largest Single Transaction: ${maxTransaction.toFixed(2)}

      ## CATEGORY BREAKDOWN (current period)
      ${JSON.stringify(categoryTotals, null, 2)}

      ## CATEGORY GROWTH vs PREVIOUS PERIOD
      ${Object.keys(previousCategoryTotals).length ? JSON.stringify(previousCategoryTotals, null, 2) : "No previous data."}

      ## TOP MERCHANTS
      ${JSON.stringify(topMerchants, null, 2)}

      ## DAY-OF-WEEK SPENDING
      ${JSON.stringify(dayPattern, null, 2)}

      ## HOURLY SPENDING
      ${JSON.stringify(hourlyPattern, null, 2)}

      ## RAW TRANSACTIONS SAMPLE
      ${JSON.stringify(cleanPayload.slice(0, 50), null, 2)}

      ## TASK: Produce an exhaustive financial audit.
      CRITICAL INSTRUCTION FOR "summary":
      The "summary" field MUST be a JSON array of 3 to 5 distinct, short, high-impact bullet point strings.
      DO NOT write a continuous paragraph. Each item in the array must be a single self-contained sentence.

      Respond ONLY with a valid JSON object matching this schema:
      {
        "summary": [
          "Short bullet point 1 synthesizing spending behavior.",
          "Short bullet point 2 highlighting income vs expense balance.",
          "Short bullet point 3 identifying top financial driver or risk factor."
        ],
        "financialHealthScore": number (0-100),
        "financialFreedomScore": number (0-100),
        "behavioralInsights": {
          "spendingPersonality": "string",
          "emotionalTriggers": ["string"],
          "suggestedHabitChanges": ["string"]
        },
        "riskAreas": ["string"],
        "recommendations": ["string"],
        "essentialVsDiscretionary": {
          "essentialAmount": number,
          "discretionaryAmount": number,
          "discretionaryRatioPercentage": number
        },
        "merchantAnalytics": [
          { "merchant": "string", "totalSpent": number, "count": number, "shareOfTotalExpense": number, "insight": "string" }
        ],
        "categoryBreakdown": [
          { "category": "string", "amount": number, "percentage": number, "insight": "string" }
        ],
        "categoryTrends": [
          { "category": "string", "previousAmount": number, "currentAmount": number, "percentChange": number, "trendDirection": "up|down|stable", "analysis": "string" }
        ],
        "cashFlowVelocity": {
          "avgDailySpend": number,
          "peakSpendingDay": { "date": "string", "amount": number },
          "projectedMonthEndExpense": number,
          "cashFlowStability": "string"
        },
        "anomalies": [
          { "date": "string", "amount": number, "description": "string", "reason": "string", "severity": "low|medium|high" }
        ],
        "recurringSubscriptions": [
          { "merchant": "string", "estimatedMonthlyCost": number, "flaggedReason": "string", "actionSuggestion": "string" }
        ],
        "spendingForecast": {
          "predictedNextMonthExpense": number,
          "highestRiskCategory": "string",
          "forecastExplanation": "string"
        },
        "taxDeductions": {
          "estimatedDeductibleExpenses": number,
          "potentialCategories": ["string"],
          "note": "string"
        },
        "suggestedBudgets": [
          { "category": "string", "currentSpending": number, "recommendedCap": number, "potentialMonthlySavings": number }
        ],
        "emergencyFundAdvice": {
          "monthsOfExpensesCovered": number,
          "recommendedMonths": number,
          "gap": number,
          "strategy": "string"
        },
        "periodComparison": {
          "previousPeriod": "string",
          "totalSpentChangePercent": number,
          "totalIncomeChangePercent": number,
          "topCategoryChange": "string",
          "overallAssessment": "string"
        }
      }
    `;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.model,
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const aiInsights = JSON.parse(completion.choices[0].message.content);

    // --- DEFENSIVE POST-PROCESSING SAFEGUARD FOR SUMMARY ---
    let formattedSummary = aiInsights.summary;

    if (typeof formattedSummary === "string") {
      // Split paragraph text by newlines or sentence endings into array elements
      formattedSummary = formattedSummary
        .split(/\r?\n|\. /)
        .map((s) => s.trim())
        .filter((s) => s.length > 5)
        .map((s) => (s.endsWith(".") ? s : s + "."));
    } else if (
      !Array.isArray(formattedSummary) ||
      formattedSummary.length === 0
    ) {
      formattedSummary = [
        "Financial analysis completed.",
        "Review detailed category metrics and risk areas below.",
      ];
    }
    // --------------------------------------------------------

    const responseData = {
      metrics: {
        totalDebited,
        totalCredited,
        netSavings,
        savingsRatePercentage: Number(savingsRate.toFixed(1)),
        totalDaysTracked,
        averageDailySpend: Number(avgDailySpend.toFixed(2)),
        medianTransaction: Number(median.toFixed(2)),
        avgTransaction: Number(avgTransaction.toFixed(2)),
        maxTransaction: Number(maxTransaction.toFixed(2)),
        topMerchantCount: topMerchants.length,
      },
      ...aiInsights,
      summary: formattedSummary,
      financialHealthScore: aiInsights.financialHealthScore ?? 50,
      financialFreedomScore: aiInsights.financialFreedomScore ?? 30,
    };

    await cacheSet(cacheKey, responseData, 3600);
    return responseData;
  }

  /**
   * Enhanced NLP Parser for Bank / UPI / Credit Card SMS logs
   */
  async parseSMSLogs(smsEntries) {
    const logArray = Array.isArray(smsEntries) ? smsEntries : [smsEntries];

    if (logArray.length === 0) {
      return [];
    }

    const prompt = `
      You are an expert NLP parser for UPI, Bank, and Credit Card SMS messages (e.g., HDFC, ICICI, SBI, Axis, Paytm, PhonePe, Cred).
      Extract deep structured metadata from these raw SMS messages:
      ${JSON.stringify(logArray)}

      Extract fields:
      - txnId: string | null
      - amount: number
      - type: "debited" | "credited"
      - bank: string
      - merchant: string
      - paymentChannel: string
      - category: string
      - confidenceScore: number
      - raw: string
      - timestamp: string | null
      - isInternational: boolean
      - additionalNotes: string | null

      Respond ONLY with a raw JSON object matching this schema:
      {
        "transactions": [
          {
            "txnId": string | null,
            "amount": number,
            "type": "debited" | "credited",
            "bank": "string",
            "merchant": "string",
            "paymentChannel": "string",
            "category": "string",
            "confidenceScore": number,
            "raw": "string",
            "timestamp": "string" | null,
            "isInternational": boolean,
            "additionalNotes": "string" | null
          }
        ]
      }
    `;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: this.model,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result.transactions || result;
  }
}

export default new AIService();
