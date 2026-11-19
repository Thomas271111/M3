import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { contactoLimiter } from "../middleware/rateLimit.js";
import { createContacto } from "../controllers/contactoController.js";

export const contactoRouter = Router();

contactoRouter.post("/", contactoLimiter, asyncHandler(createContacto));
