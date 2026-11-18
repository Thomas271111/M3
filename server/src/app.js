import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);
