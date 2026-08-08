import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log", level: "info" }),
    new winston.transports.File({
      filename: "logs/errors.log",
      level: "error",
    }),
  ],
});

logger.exceptions.handle(
  new winston.transports.File({ filename: "logs/exceptions.log" }),
);

export default logger;
