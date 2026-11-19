import { Router } from "express";
import { asyncHandler as h } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { listVacunas, createVacuna, updateVacuna, deleteVacuna } from "../controllers/vacunasController.js";

export const vacunasRouter = Router();

vacunasRouter.use(authenticate);

vacunasRouter.get("/", h(listVacunas));
vacunasRouter.post("/", h(createVacuna));
vacunasRouter.put("/:id", h(updateVacuna));
vacunasRouter.delete("/:id", authorize("dueno"), h(deleteVacuna));
