import { randomBytes } from "node:crypto";
import { Animal } from "../models/Animal.js";
import { Finca } from "../models/Finca.js";
import { User } from "../models/User.js";
import { Vacuna } from "../models/Vacuna.js";
import { HttpError } from "../utils/httpError.js";
import { isObjectId } from "../utils/ids.js";
import { pickClean } from "../utils/sanitize.js";
import { buildSeedAnimales, buildSeedVacunas } from "../utils/seedData.js";
import { validateFinca } from "../validators/dataValidators.js";

const FINCA_FIELDS = ["nombre", "propietario", "vereda", "municipio", "departamento", "codigoICA"];

export async function getMiFinca(req, res) {
  res.json(await Finca.findById(req.user.fincaId));
}

export async function updateMiFinca(req, res) {
  const data = pickClean(req.body, FINCA_FIELDS);
  if (!Object.keys(data).length) throw new HttpError(400, "No hay cambios para guardar");
  const errors = validateFinca(data);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  const finca = await Finca.findByIdAndUpdate(req.user.fincaId, { $set: data }, { new: true, runValidators: true });
  res.json(finca);
}

// --- Invitaciones y trabajadores (solo dueño) ---

export async function getInvitacion(req, res) {
  const finca = await Finca.findById(req.user.fincaId).select("+codigoInvitacion");
  res.json({ codigoInvitacion: finca?.codigoInvitacion || null });
}

export async function generarInvitacion(req, res) {
  const codigoInvitacion = randomBytes(5).toString("hex").toUpperCase(); // 40 bits, 10 caracteres
  await Finca.findByIdAndUpdate(req.user.fincaId, { $set: { codigoInvitacion } }); // el anterior queda invalidado
  res.json({ codigoInvitacion });
}

export async function listTrabajadores(req, res) {
  res.json(await User.find({ fincaId: req.user.fincaId, rol: "trabajador" }).sort({ createdAt: 1 }));
}

export async function removeTrabajador(req, res) {
  const notFound = new HttpError(404, "Trabajador no encontrado");
  if (!isObjectId(req.params.id)) throw notFound;
  // Filtrar por fincaId y rol: un dueño no puede borrar usuarios de otra finca ni a otro dueño.
  const user = await User.findOneAndDelete({ _id: req.params.id, fincaId: req.user.fincaId, rol: "trabajador" });
  if (!user) throw notFound;
  res.status(204).end();
}

// --- Datos de demostración ---

export async function resetDemo(req, res) {
  const { fincaId } = req.user;
  await Vacuna.deleteMany({ fincaId });
  await Animal.deleteMany({ fincaId });

  const animales = await Animal.insertMany(buildSeedAnimales(fincaId));
  const vacunas = await Vacuna.insertMany(buildSeedVacunas(fincaId, animales));
  res.json({ animales: animales.length, vacunas: vacunas.length });
}
