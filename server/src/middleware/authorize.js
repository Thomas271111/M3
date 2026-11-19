import { HttpError } from "../utils/httpError.js";

// Se usa después de `authenticate`: authorize("dueno") deja pasar solo a ese rol.
// La regla vive en el servidor; ocultar el botón en el cliente es solo comodidad.
export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new HttpError(403, "No tienes permiso para realizar esta acción"));
    }
    next();
  };
