/**
 * Utility to calculate date ranges for stats, analytics, comparison, and patterns
 */
export const getDateRange = (period = "thismonth") => {
  const now = new Date();
  let startDate, endDate;

  switch (period.toLowerCase()) {
    case "thismonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      break;

    case "lastmonth":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;

    case "thisyear":
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;

    case "all":
    default:
      startDate = new Date(0); // Epoch start
      endDate = new Date();
      break;
  }

  return { startDate, endDate };
};
