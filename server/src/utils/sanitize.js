// Defensa contra XSS: el servidor nunca guarda HTML en campos de texto libre.
// (React ya escapa al renderizar; esto es una segunda capa para que los datos
// tampoco lleguen sucios a CSV, reportes impresos o a otros clientes.)
// Una etiqueta empieza con "<" + letra, "/", "!" o "?" (completa o truncada, p. ej. "<script" sin cerrar).
// Así "peso <300 kg" o "< 3 años" se conservan: no son etiquetas y los navegadores no las interpretan.
const TAGS_RE = /<[/a-zA-Z!?][^>]*>?/g;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value) {
  if (typeof value !== "string") return value;
  return value.replace(CONTROL_RE, "").replace(TAGS_RE, "").trim();
}

// Devuelve solo las claves permitidas y limpia las que son texto.
export function pickClean(body, allowed) {
  const out = {};
  for (const key of allowed) {
    if (body?.[key] !== undefined) out[key] = cleanText(body[key]);
  }
  return out;
}
