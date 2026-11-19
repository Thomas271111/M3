// Único punto de contacto con el backend: añade el JWT, normaliza errores y avisa si la sesión expiró.
// El valor por defecto solo existe en desarrollo: en producción, olvidar VITE_API_URL debe fallar a la vista
// en vez de apuntar en silencio a localhost.
const BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000/api" : "")).replace(/\/$/, "");
const TOKEN_KEY = "mihato:token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage no disponible: la sesión durará solo hasta recargar */
  }
}

export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let onUnauthorized = () => {};
// AuthContext registra aquí su logout: cualquier 401 con sesión activa la cierra.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(method, path, body) {
  if (!BASE_URL) throw new ApiError(0, "La aplicación no está configurada: falta VITE_API_URL en el despliegue.");
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data?.message || "Ocurrió un error inesperado.", data?.errors);
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  put: (path, body) => request("PUT", path, body),
  del: (path) => request("DELETE", path)
};
