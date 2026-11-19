import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

const contactoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    correo: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    finca: { type: String, required: true, trim: true, maxlength: 120 },
    cabezas: { type: Number, required: true, min: 1, max: 100000 }
  },
  { timestamps: true, toJSON: jsonOptions }
);

export const Contacto = mongoose.model("Contacto", contactoSchema);
