import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const ALGORITHM = "HS256";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 16) throw new Error("JWT_SECRET no configurado (mínimo 16 caracteres)");
  return value;
}

export function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(user) {
  return jwt.sign({ rol: user.rol, fincaId: user.fincaId.toString() }, secret(), {
    subject: user.id,
    algorithm: ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

// Se fija el algoritmo para rechazar tokens con alg:none o firmados con otro esquema.
export function verifyToken(token) {
  return jwt.verify(token, secret(), { algorithms: [ALGORITHM] });
}
