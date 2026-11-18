import { User } from "../models/User.js";
import { verifyToken } from "../utils/auth.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new HttpError(401, "Sesión no iniciada");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, "Sesión inválida o expirada");
  }

  // El rol y la finca se leen de la base de datos: si desvinculan al usuario, pierde acceso al instante.
  const user = await User.findById(payload.sub).select("rol fincaId");
  if (!user) throw new HttpError(401, "Sesión inválida o expirada");

  req.user = { id: user.id, rol: user.rol, fincaId: user.fincaId.toString() };
  next();
});
