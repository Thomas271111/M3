import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

export const CATEGORIAS = ["Ternero", "Ternera", "Novillo", "Novilla", "Vaca", "Toro"];
export const ESTADOS = ["Activo", "Vendido", "Muerto"];

const animalSchema = new mongoose.Schema(
  {
    fincaId: { type: mongoose.Schema.Types.ObjectId, ref: "Finca", required: true, index: true },
    arete: { type: String, required: true, trim: true, maxlength: 40 },
    nombre: { type: String, trim: true, maxlength: 80, default: "" },
    sexo: { type: String, enum: ["H", "M"], required: true },
    categoria: { type: String, enum: CATEGORIAS, required: true },
    raza: { type: String, trim: true, maxlength: 80, default: "" },
    fechaNacimiento: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    pesoKg: { type: Number, min: 0, default: 0 },
    potrero: { type: String, trim: true, maxlength: 80, default: "" },
    estado: { type: String, enum: ESTADOS, default: "Activo" },
    notas: { type: String, trim: true, maxlength: 500, default: "" },
    fechaRegistro: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ }
  },
  { timestamps: true, toJSON: jsonOptions }
);

animalSchema.index({ fincaId: 1, arete: 1 }, { unique: true });

export const Animal = mongoose.model("Animal", animalSchema);
