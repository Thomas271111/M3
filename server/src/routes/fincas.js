import { Router } from "express";
import { asyncHandler as h } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  getMiFinca,
  updateMiFinca,
  getInvitacion,
  generarInvitacion,
  listTrabajadores,
  removeTrabajador,
  resetDemo
} from "../controllers/fincasController.js";

export const fincasRouter = Router();

fincasRouter.use(authenticate);

// Ambos roles
fincasRouter.get("/mi-finca", h(getMiFinca));

// Solo dueño
const dueno = authorize("dueno");
fincasRouter.put("/mi-finca", dueno, h(updateMiFinca));
fincasRouter.get("/invitacion", dueno, h(getInvitacion));
fincasRouter.post("/invitacion", dueno, h(generarInvitacion));
fincasRouter.get("/trabajadores", dueno, h(listTrabajadores));
fincasRouter.delete("/trabajadores/:id", dueno, h(removeTrabajador));
fincasRouter.post("/reset-demo", dueno, h(resetDemo));
