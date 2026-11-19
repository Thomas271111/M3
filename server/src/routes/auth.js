import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { register, registerWorker, login, me } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, asyncHandler(register));
authRouter.post("/register-worker", authLimiter, asyncHandler(registerWorker));
authRouter.post("/login", authLimiter, asyncHandler(login));
authRouter.get("/me", authenticate, asyncHandler(me));
