// Mismas reglas que client/src/authValidators.js; el servidor nunca confía en el cliente.
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function validateEmail(value) {
  if (typeof value !== "string" || !value.trim()) return "Ingresa tu correo electrónico.";
  if (value.trim().length > 254 || !EMAIL_RE.test(value.trim())) return "Ingresa un correo con un formato válido.";
  return "";
}

function validatePassword(value) {
  if (typeof value !== "string" || !value) return "Ingresa tu contraseña.";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (value.length > 128) return "La contraseña no puede superar 128 caracteres.";
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) return "Debe incluir al menos una letra y un número.";
  return "";
}

function clean(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, msg]) => msg));
}

export function validateLogin({ email, password } = {}) {
  const passwordOk = typeof password === "string" && password && password.length <= 128;
  return clean({ email: validateEmail(email), password: passwordOk ? "" : "Ingresa tu contraseña." });
}

export function validateRegisterWorker({ email, password, codigo } = {}) {
  return clean({
    email: validateEmail(email),
    password: validatePassword(password),
    codigo: typeof codigo === "string" && codigo.trim() && codigo.length <= 40 ? "" : "Ingresa el código de invitación."
  });
}

export function validateRegister({ email, password, fincaNombre } = {}) {
  return clean({
    email: validateEmail(email),
    password: validatePassword(password),
    fincaNombre: typeof fincaNombre === "string" && fincaNombre.trim() ? "" : "Ingresa el nombre de tu finca."
  });
}
