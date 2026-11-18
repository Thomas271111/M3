import mongoose from "mongoose";
import { jsonOptions } from "./schemaOptions.js";

export const ROLES = ["dueno", "trabajador"];

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ROLES, required: true },
    fincaId: { type: mongoose.Schema.Types.ObjectId, ref: "Finca", required: true, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      ...jsonOptions,
      transform(doc, ret) {
        jsonOptions.transform(doc, ret);
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

export const User = mongoose.model("User", userSchema);
