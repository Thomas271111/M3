import { Router } from "express";
import { asyncHandler as h } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { listAnimales, getAnimal, createAnimal, updateAnimal, deleteAnimal } from "../controllers/animalesController.js";

export const animalesRouter = Router();

animalesRouter.use(authenticate);

animalesRouter.get("/", h(listAnimales));
animalesRouter.get("/:id", h(getAnimal));
animalesRouter.post("/", h(createAnimal));
animalesRouter.put("/:id", h(updateAnimal));
animalesRouter.delete("/:id", authorize("dueno"), h(deleteAnimal));
