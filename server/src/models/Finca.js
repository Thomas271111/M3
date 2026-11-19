import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

const fincaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    propietario: { type: String, trim: true, maxlength: 120, default: "" },
    vereda: { type: String, trim: true, maxlength: 120, default: "" },
    municipio: { type: String, trim: true, maxlength: 120, default: "" },
    departamento: { type: String, trim: true, maxlength: 120, default: "" },
    codigoICA: { type: String, trim: true, maxlength: 120, default: "" },
    unidadPeso: { type: String, enum: ["kg", "lb"], default: "kg" },
    // select:false → nunca viaja en /me, /login ni /mi-finca (un trabajador no debe verlo).
    // Solo el endpoint del dueño lo pide con .select("+codigoInvitacion").
    codigoInvitacion: { type: String, unique: true, sparse: true, select: false }
  },
  { timestamps: true, toJSON: jsonOptions }
);

export const Finca = mongoose.model("Finca", fincaSchema);
