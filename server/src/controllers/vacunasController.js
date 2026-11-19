import { Animal } from "../models/Animal.js";
import { Vacuna } from "../models/Vacuna.js";
import { HttpError } from "../utils/httpError.js";
import { isObjectId, todayISO } from "../utils/ids.js";
import { pickClean } from "../utils/sanitize.js";
import { validateVacuna } from "../validators/dataValidators.js";

const CREATE_FIELDS = ["animalId", "tipo", "fecha", "fechaProximaDosis", "lote", "veterinario", "notas"];
// Un registro de vacuna no se "traslada" a otro animal: se elimina y se vuelve a crear.
const UPDATE_FIELDS = CREATE_FIELDS.filter((f) => f !== "animalId");

const notFound = () => new HttpError(404, "Registro de vacuna no encontrado");

export async function listVacunas(req, res) {
  const { animalId } = req.query;
  const filter = { fincaId: req.user.fincaId };
  if (animalId !== undefined) {
    if (!isObjectId(animalId)) throw new HttpError(400, "animalId inválido");
    filter.animalId = animalId;
  }
  res.json(await Vacuna.find(filter).sort({ fecha: -1 }));
}

export async function createVacuna(req, res) {
  const data = pickClean(req.body, CREATE_FIELDS);
  const errors = validateVacuna(data);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  // El animal debe ser de la misma finca: evita colgar vacunas de animales ajenos.
  const animal = await Animal.exists({ _id: data.animalId, fincaId: req.user.fincaId });
  if (!animal) throw new HttpError(404, "Animal no encontrado");

  const vacuna = await Vacuna.create({ ...data, fincaId: req.user.fincaId, fechaRegistro: todayISO() });
  res.status(201).json(vacuna);
}

export async function updateVacuna(req, res) {
  if (!isObjectId(req.params.id)) throw notFound();
  const data = pickClean(req.body, UPDATE_FIELDS);
  if (!Object.keys(data).length) throw new HttpError(400, "No hay cambios para guardar");
  const errors = validateVacuna(data, { partial: true });
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  const vacuna = await Vacuna.findOneAndUpdate(
    { _id: req.params.id, fincaId: req.user.fincaId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!vacuna) throw notFound();
  res.json(vacuna);
}

export async function deleteVacuna(req, res) {
  if (!isObjectId(req.params.id)) throw notFound();
  const vacuna = await Vacuna.findOneAndDelete({ _id: req.params.id, fincaId: req.user.fincaId });
  if (!vacuna) throw notFound();
  res.status(204).end();
}
