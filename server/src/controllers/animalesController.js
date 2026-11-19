import { Animal, ESTADOS } from "../models/Animal.js";
import { Vacuna } from "../models/Vacuna.js";
import { HttpError } from "../utils/httpError.js";
import { isObjectId, todayISO } from "../utils/ids.js";
import { pickClean } from "../utils/sanitize.js";
import { validateAnimal } from "../validators/dataValidators.js";

// Lista blanca: fincaId, fechaRegistro y cualquier otro campo del cuerpo se ignoran.
const FIELDS = ["arete", "nombre", "sexo", "categoria", "raza", "fechaNacimiento", "pesoKg", "potrero", "estado", "notas"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function areteRepetido(err) {
  return err.code === 11000 ? new HttpError(409, "Ya existe un animal con ese arete en tu finca") : err;
}

function notFound() {
  return new HttpError(404, "Animal no encontrado");
}

export async function listAnimales(req, res) {
  const { estado, potrero, q } = req.query;
  const filter = { fincaId: req.user.fincaId };

  // Los filtros deben ser strings: ?estado[$ne]=x llegaría como objeto y es un intento de inyección.
  for (const value of [estado, potrero, q]) {
    if (value !== undefined && typeof value !== "string") throw new HttpError(400, "Filtros inválidos");
  }
  if (estado) {
    if (!ESTADOS.includes(estado)) throw new HttpError(400, "Estado inválido");
    filter.estado = estado;
  }
  if (potrero) filter.potrero = potrero;
  if (q?.trim()) {
    const re = new RegExp(escapeRegex(q.trim().slice(0, 60)), "i");
    filter.$or = [{ arete: re }, { nombre: re }];
  }

  res.json(await Animal.find(filter).sort({ arete: 1 }));
}

export async function getAnimal(req, res) {
  if (!isObjectId(req.params.id)) throw notFound();
  const animal = await Animal.findOne({ _id: req.params.id, fincaId: req.user.fincaId });
  if (!animal) throw notFound();
  res.json(animal);
}

export async function createAnimal(req, res) {
  const data = pickClean(req.body, FIELDS);
  const errors = validateAnimal(data);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  try {
    const animal = await Animal.create({ ...data, fincaId: req.user.fincaId, fechaRegistro: todayISO() });
    res.status(201).json(animal);
  } catch (err) {
    throw areteRepetido(err);
  }
}

export async function updateAnimal(req, res) {
  if (!isObjectId(req.params.id)) throw notFound();
  const data = pickClean(req.body, FIELDS);
  if (!Object.keys(data).length) throw new HttpError(400, "No hay cambios para guardar");
  const errors = validateAnimal(data, { partial: true });
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  try {
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, fincaId: req.user.fincaId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!animal) throw notFound();
    res.json(animal);
  } catch (err) {
    throw areteRepetido(err);
  }
}

export async function deleteAnimal(req, res) {
  if (!isObjectId(req.params.id)) throw notFound();
  const animal = await Animal.findOneAndDelete({ _id: req.params.id, fincaId: req.user.fincaId });
  if (!animal) throw notFound();
  await Vacuna.deleteMany({ animalId: animal._id, fincaId: req.user.fincaId });
  res.status(204).end();
}
