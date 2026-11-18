import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

const fincaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    propietario: { type: String, trim: true, default: "" },
    vereda: { type: String, trim: true, default: "" },
    municipio: { type: String, trim: true, default: "" },
    departamento: { type: String, trim: true, default: "" },
    codigoICA: { type: String, trim: true, default: "" },
    unidadPeso: { type: String, enum: ["kg", "lb"], default: "kg" },
    codigoInvitacion: { type: String, unique: true, sparse: true }
  },
  { timestamps: true, toJSON: jsonOptions }
);

export const Finca = mongoose.model("Finca", fincaSchema);
