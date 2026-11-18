export function notFound(req, res) {
  res.status(404).json({ message: "Ruta no encontrada" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const body = { message: status === 500 ? "Error interno del servidor" : err.message };
  if (err.errors) body.errors = err.errors;
  if (process.env.NODE_ENV !== "production") {
    body.stack = err.stack;
  }
  if (status === 500) console.error(err);
  res.status(status).json(body);
}
