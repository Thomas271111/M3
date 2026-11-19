import rateLimit from "express-rate-limit";

const make = (windowMinutes, limit, message, extra = {}) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
    ...extra
  });

// Límite general para toda la API.
export const apiLimiter = make(15, 300, "Demasiadas solicitudes, intenta de nuevo en unos minutos");

// Login y registros: frena la fuerza bruta de contraseñas y de códigos de invitación.
// Solo cuentan los intentos fallidos, así un usuario legítimo nunca se bloquea.
export const authLimiter = make(15, 20, "Demasiados intentos, espera 15 minutos e inténtalo de nuevo", {
  skipSuccessfulRequests: true
});

// Ruta pública de contacto: evita que alguien llene la colección.
export const contactoLimiter = make(60, 5, "Ya enviaste varios mensajes, intenta de nuevo más tarde");
