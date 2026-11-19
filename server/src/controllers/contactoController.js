import { Contacto } from "../models/Contacto.js";
import { HttpError } from "../utils/httpError.js";
import { pickClean } from "../utils/sanitize.js";
import { validateContacto } from "../validators/dataValidators.js";

// Ruta pública (no hay sesión): la protegen el rate limit, la validación y la lista blanca de campos.
export async function createContacto(req, res) {
  const data = pickClean(req.body, ["nombre", "correo", "finca", "cabezas"]);
  const errors = validateContacto(data);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  await Contacto.create(data);
  res.status(201).json({ ok: true });
}
