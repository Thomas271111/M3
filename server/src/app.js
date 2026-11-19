import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { connectDB } from "./config/db.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { animalesRouter } from "./routes/animales.js";
import { vacunasRouter } from "./routes/vacunas.js";
import { fincasRouter } from "./routes/fincas.js";
import { contactoRouter } from "./routes/contacto.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

// Detrás del proxy de Vercel: sin esto el rate limit vería la misma IP para todos.
app.set("trust proxy", 1);

// CLIENT_URL admite varios orígenes separados por coma.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((o) => o.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize()); // elimina claves con "$" o "." del body/query/params (inyección NoSQL)

app.use("/api/health", healthRouter);

app.use("/api", apiLimiter);
// En serverless cada petición puede caer en una instancia fría: asegura la conexión (se reutiliza si ya existe).
app.use(
  "/api",
  asyncHandler(async (req, res, next) => {
    await connectDB();
    next();
  })
);

app.use("/api/auth", authRouter);
app.use("/api/animales", animalesRouter);
app.use("/api/vacunas", vacunasRouter);
app.use("/api/fincas", fincasRouter);
app.use("/api/contacto", contactoRouter);

app.use(notFound);
app.use(errorHandler);
