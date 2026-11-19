# AI Log — MiHato

## Sobre este registro

Este documento deja constancia del uso de inteligencia artificial (Claude, de Anthropic, a través de Claude Code) como **apoyo de desarrollo** durante la construcción del prototipo MiHato. La IA se usó como asistente de implementación: escribió código y contenido siguiendo instrucciones y decisiones tomadas por el autor del proyecto en cada etapa, no como un generador autónomo que decidiera el producto por su cuenta. Las decisiones de alcance, estilo, funcionalidad y prioridades quedaron siempre del lado del estudiante; la IA propuso opciones, hizo preguntas de aclaración antes de construir, y ejecutó lo acordado.

## Sesión 1 — Alcance y prototipo base de la app

**Pedido:** construir MiHato como sitio + prototipo de app, con un stack técnico específico ya definido (Vite con salida a `docs/`, Tailwind CSS v4, JavaScript vanilla sin librerías, ESLint con reglas concretas).

**Apoyo de la IA:** antes de escribir código, la IA hizo preguntas puntuales de alcance en vez de asumir — cuántas páginas construir, si los datos debían ser interactivos o solo maquetas fijas, qué dirección de estilo visual usar, y si incluir pantallas de login. Con las respuestas del estudiante (solo prototipo de app, datos interactivos con `localStorage`, estilo "rústico-cálido", sin login), la IA generó el scaffolding del proyecto y las seis pantallas iniciales de la app (Dashboard, Animales, Detalle de animal, Vacunación, Trazabilidad, Configuración), incluyendo el sistema de diseño, la capa de datos y el layout responsivo.


## Sesión 2 — Landing page de marketing

**Pedido:** agregar una página de marketing que explicara el problema real (conteo manual, fechas de vacunación perdidas, falta de trazabilidad ante el ICA) y cómo MiHato lo resuelve, con un diseño atractivo.

**Apoyo de la IA:** propuso la estructura de secciones (problema → solución → cómo funciona → público objetivo → llamado a la acción) y la construyó reutilizando el mismo sistema de diseño de la app. Esto implicó reorganizar el proyecto: la página principal pasó a ser la landing y el dashboard se movió a su propia ruta, actualizando todos los enlaces internos.


## Sesión 3 — FAQ con buscador, página de contacto y corrección de bugs

**Pedido** agregar una sección de preguntas frecuentes con un buscador activable por un atajo de teclado específico, y una página de contacto aparte con formulario (nombre, correo, finca, cabezas de ganado) accesible mediante un botón; además, corregir el parpadeo reportado en la sesión anterior.

**Apoyo de la IA:** diagnosticó la causa del parpadeo (el CSS se cargaba de forma indirecta desde JavaScript en vez de como una hoja de estilos nativa) y lo corrigió en las ocho páginas del sitio. Construyó la sección de FAQ con acordeón, buscador en vivo y un "command palette" activable con `Ctrl/Cmd + K` (con navegación por teclado y una alternativa visible con clic, para no depender solo del atajo). Creó la página de contacto con su formulario y guardado local de las respuestas.

**Verificación:** la IA probó cada interacción nueva en el navegador (atajo de teclado, filtrado del buscador, envío del formulario) antes de dar el avance por terminado.


## Sesión M3 — Backend, autenticación con roles y conexión del frontend

**Pedido:** completar el Milestone 3 (React + Express + MongoDB Atlas + JWT con dos roles, desplegable en Vercel) a partir de `TICKETS.md` y del código que el equipo ya tenía (cliente de M2 con `localStorage`; servidor con Express base, modelos y registro/login).

**Apoyo de la IA:** analizó el repositorio, comparó el estado real contra los tickets y la rúbrica de M3, y propuso el orden de trabajo. Implementó los endpoints que faltaban (roles e invitaciones, CRUD de animales y vacunas, finca, contacto), la capa de seguridad (`express-mongo-sanitize`, limpieza de HTML, validación de tipos, rate limit, JWT con algoritmo fijado) y la configuración serverless para Vercel. En el cliente reemplazó el login simulado y los datos en `localStorage` por un módulo `api.js`, `AuthContext` con JWT, `DataContext` alimentado por la API, registro de dueño y de trabajador, permisos por rol en la interfaz y gestión de trabajadores. Reescribió el README y actualizó los textos de la landing que ya no eran ciertos.

**Decisiones que tomó el estudiante** (la IA preguntó en lugar de asumir): los reportes de trazabilidad se calculan en el cliente con los datos de la API; el formulario de contacto se guarda en MongoDB; un dueño nuevo empieza con el hato vacío (los datos de ejemplo se cargan desde Configuración); la base de datos se prueba contra el cluster de Atlas del equipo.

**Decisiones técnicas tomadas por la IA y que el equipo debe poder explicar:**
- `fincaId` y `rol` salen siempre del servidor (token + base de datos), nunca del cuerpo de la petición; los ids de otra finca devuelven 404.
- `codigoInvitacion` se guarda con `select: false` para que un trabajador no lo vea en `/me` ni en `/mi-finca`; se añadió `GET /api/fincas/invitacion` (no estaba en los tickets) para que el dueño pueda ver su código vigente al recargar.
- El rate limit de login solo cuenta intentos fallidos; en Vercel su contador es por instancia (limitación documentada en el README).
- Se añadió la variable opcional `DNS_SERVERS` porque Node, en la máquina de desarrollo, no resolvía registros SRV de Atlas (el DNS del sistema sí).

**Revisión posterior (segunda pasada):** a petición del estudiante se revisó todo otra vez y se corrigieron cuatro cosas: (1) la limpieza de HTML borraba texto legítimo como "peso <300 kg", y ahora solo elimina lo que realmente es una etiqueta; (2) el nombre de la finca en el registro no pasaba por esa limpieza; (3) correo y contraseña no tenían tope de longitud; (4) el stack de errores se ocultaba solo si `NODE_ENV === "production"`, y ahora es opt-in. También se hizo que el cliente falle a la vista si en producción falta `VITE_API_URL` (antes apuntaba en silencio a `localhost`) y se aplicaron los parches de `npm audit` a las dependencias de desarrollo. Se añadió una segunda batería de 29 pruebas (JWT con `alg=none` o firma ajena, CORS, cuerpos de más de 100 KB, escritura entre fincas, valores `null`, etc.).

**Verificación:** se escribió una prueba de extremo a extremo contra Atlas (71 comprobaciones: CRUD, 403 del trabajador en todas las rutas de dueño, 404 entre fincas, inyección `$ne`/`$gt`, XSS, JSON roto, desvinculación inmediata) y todas pasaron. En el navegador se probó el registro de dueño, el login con error, la creación de un animal con `<script>` en el nombre, la invitación y registro de un trabajador, que no ve botones de eliminar ni la zona de riesgo, la recarga con sesión y el cierre de sesión por `401`. También se verificó el rate limit (429 tras los intentos fallidos), `npm run lint` y `npm run build`. **Pendiente al escribir esto:** el despliegue en Vercel y la prueba de extremo a extremo en la URL pública.

## Resumen del rol de la IA

En ningún momento la IA definió por sí sola qué construir: cada funcionalidad, corrección o sección nueva partió de un pedido explícito del estudiante, y las decisiones de producto (alcance de páginas, si los datos debían persistir, estilo visual, qué validar, qué preguntas incluir en el FAQ) fueron tomadas por él. El aporte de la IA fue de **implementación, redacción de contenido y verificación técnica** (lint, build y pruebas funcionales en navegador) bajo esa dirección.



