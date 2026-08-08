import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.status || (res.statusCode === 200 ? 500 : res.statusCode);

  logger.error(
    `🚨 Error: ${err.message} | Status: ${statusCode} | Path: ${req.originalUrl}`,
  );

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
