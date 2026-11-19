export function notFound(req, res) {
  res.status(404).json({ message: "Ruta no encontrada" });
}

// Traduce errores de Mongoose/Express a respuestas HTTP; el resto es un 500 sin detalles.
function normalize(err) {
  if (err.code === 11000) return { status: 409, message: "Ya existe un registro con ese valor" };
  if (err.name === "ValidationError") {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
    return { status: 400, message: "Datos inválidos", errors };
  }
  if (err.name === "CastError") return { status: 400, message: "Valor o identificador inválido" };
  if (err.type === "entity.parse.failed") return { status: 400, message: "JSON inválido" };
  if (err.type === "entity.too.large") return { status: 413, message: "La solicitud es demasiado grande" };
  return { status: err.status || 500, message: err.message, errors: err.errors };
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const { status, message, errors } = normalize(err);
  const body = { message: status === 500 ? "Error interno del servidor" : message };
  if (errors) body.errors = errors;
  // El stack es opt-in: solo con NODE_ENV=development. Si la variable falta, no se filtra nada.
  if (process.env.NODE_ENV === "development") body.stack = err.stack;
  if (status === 500) console.error(err);
  res.status(status).json(body);
}
