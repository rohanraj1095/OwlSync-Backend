import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";

import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// app.disable("etag");

app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));
app.use(mongoSanitize());
app.use(xssClean());
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.get("/", (req, res) => {
  res.send("Server is up and running");
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;
