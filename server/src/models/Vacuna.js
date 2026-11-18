import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

export const TIPOS_VACUNA = ["aftosa", "brucelosis", "carbon", "ibr", "rabia"];
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const vacunaSchema = new mongoose.Schema(
  {
    fincaId: { type: mongoose.Schema.Types.ObjectId, ref: "Finca", required: true, index: true },
    animalId: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true, index: true },
    tipo: { type: String, enum: TIPOS_VACUNA, required: true },
    fecha: { type: String, required: true, match: FECHA },
    fechaProximaDosis: { type: String, match: FECHA, default: null },
    lote: { type: String, trim: true, maxlength: 40, default: "" },
    veterinario: { type: String, trim: true, maxlength: 80, default: "" },
    notas: { type: String, trim: true, maxlength: 500, default: "" },
    fechaRegistro: { type: String, match: FECHA }
  },
  { timestamps: true, toJSON: jsonOptions }
);

export const Vacuna = mongoose.model("Vacuna", vacunaSchema);
