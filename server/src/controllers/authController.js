import { Finca } from "../models/Finca.js";
import { User } from "../models/User.js";
import { comparePassword, hashPassword, signToken } from "../utils/auth.js";
import { HttpError } from "../utils/httpError.js";
import { validateLogin, validateRegister } from "../validators/authValidators.js";

export async function register(req, res) {
  const errors = validateRegister(req.body);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  const { email, password, fincaNombre } = req.body;
  if (await User.exists({ email: email.trim().toLowerCase() })) {
    throw new HttpError(409, "Ya existe una cuenta con ese correo");
  }

  const finca = await Finca.create({ nombre: fincaNombre.trim() });
  try {
    const user = await User.create({
      email,
      passwordHash: await hashPassword(password),
      rol: "dueno",
      fincaId: finca.id
    });
    res.status(201).json({ token: signToken(user), user, finca });
  } catch (err) {
    await Finca.findByIdAndDelete(finca.id); // no dejar fincas huérfanas si falla el usuario
    throw err;
  }
}

export async function login(req, res) {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length) throw new HttpError(400, "Datos inválidos", errors);

  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
  const valid = user && (await comparePassword(password, user.passwordHash));
  if (!valid) throw new HttpError(401, "Correo o contraseña incorrectos"); // mensaje genérico a propósito

  const finca = await Finca.findById(user.fincaId);
  res.json({ token: signToken(user), user, finca });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  const finca = await Finca.findById(req.user.fincaId);
  res.json({ user, finca });
}
