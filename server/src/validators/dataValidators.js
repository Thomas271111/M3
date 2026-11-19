import { CATEGORIAS, ESTADOS } from "../models/Animal.js";
import { TIPOS_VACUNA } from "../models/Vacuna.js";

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (typeof value !== "string" || !FECHA_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const isString = (v) => typeof v === "string";
const tooLong = (v, max) => isString(v) && v.length > max;

function clean(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

// `partial` = true en PUT: solo se valida lo que venga en el cuerpo.
export function validateAnimal(data, { partial = false } = {}) {
  const has = (k) => data[k] !== undefined;
  const need = (k) => !partial || has(k);
  const errors = {};

  if (need("arete") && (!isString(data.arete) || !data.arete)) errors.arete = "Ingresa el arete o ID del animal.";
  else if (tooLong(data.arete, 40)) errors.arete = "El arete es demasiado largo (máx. 40).";

  if (need("sexo") && !["H", "M"].includes(data.sexo)) errors.sexo = "Sexo inválido.";
  if (need("categoria") && !CATEGORIAS.includes(data.categoria)) errors.categoria = "Categoría inválida.";
  if (has("estado") && !ESTADOS.includes(data.estado)) errors.estado = "Estado inválido.";

  if (need("fechaNacimiento") && !isRealDate(data.fechaNacimiento)) errors.fechaNacimiento = "Fecha de nacimiento inválida.";

  if (has("pesoKg")) {
    const n = data.pesoKg;
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 3000) errors.pesoKg = "El peso debe ser un número entre 0 y 3000.";
  }

  for (const [k, max] of [["nombre", 80], ["raza", 80], ["potrero", 80], ["notas", 500]]) {
    if (has(k) && (!isString(data[k]) || data[k].length > max)) errors[k] = `Texto inválido o demasiado largo (máx. ${max}).`;
  }
  return clean(errors);
}

export function validateVacuna(data, { partial = false } = {}) {
  const has = (k) => data[k] !== undefined;
  const need = (k) => !partial || has(k);
  const errors = {};

  if (need("animalId") && (!isString(data.animalId) || !/^[a-f\d]{24}$/i.test(data.animalId))) errors.animalId = "Animal inválido.";
  if (need("tipo") && !TIPOS_VACUNA.includes(data.tipo)) errors.tipo = "Tipo de vacuna inválido.";
  if (need("fecha") && !isRealDate(data.fecha)) errors.fecha = "Fecha de aplicación inválida.";
  if (has("fechaProximaDosis") && data.fechaProximaDosis !== null && !isRealDate(data.fechaProximaDosis)) {
    errors.fechaProximaDosis = "Fecha de próxima dosis inválida.";
  }
  for (const [k, max] of [["lote", 40], ["veterinario", 80], ["notas", 500]]) {
    if (has(k) && (!isString(data[k]) || data[k].length > max)) errors[k] = `Texto inválido o demasiado largo (máx. ${max}).`;
  }
  return clean(errors);
}

export function validateFinca(data) {
  const errors = {};
  if (data.nombre !== undefined && (!isString(data.nombre) || !data.nombre)) errors.nombre = "Ingresa el nombre de la finca.";
  for (const k of ["nombre", "propietario", "vereda", "municipio", "departamento", "codigoICA"]) {
    if (data[k] !== undefined && (!isString(data[k]) || data[k].length > 120)) errors[k] = "Texto inválido o demasiado largo (máx. 120).";
  }
  return clean(errors);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContacto(data) {
  const errors = {};
  if (!isString(data.nombre) || !data.nombre) errors.nombre = "Ingresa tu nombre completo.";
  else if (data.nombre.length > 120) errors.nombre = "El nombre es demasiado largo.";
  if (!isString(data.correo) || !EMAIL_RE.test(data.correo)) errors.correo = "Ingresa un correo válido.";
  else if (data.correo.length > 160) errors.correo = "El correo es demasiado largo.";
  if (!isString(data.finca) || !data.finca) errors.finca = "Ingresa el nombre de tu finca.";
  else if (data.finca.length > 120) errors.finca = "El nombre de la finca es demasiado largo.";
  if (!Number.isInteger(data.cabezas) || data.cabezas < 1 || data.cabezas > 100000) {
    errors.cabezas = "Ingresa un número entero de cabezas entre 1 y 100000.";
  }
  return clean(errors);
}

export { isRealDate };
