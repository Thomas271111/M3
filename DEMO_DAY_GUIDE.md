# Guion del Demo Day — MiHato (Milestone 3)

12 minutos por equipo: **5 min de demo en vivo**, **5 min de arquitectura**, **2 min de preguntas**. La rúbrica pide que la demo cubra las 3 funcionalidades de punta a punta **sin "confíen en mí"**: todo lo que se diga debe verse funcionando.

> La guía de M2 ([`ORAL_DEFENSE_GUIDE.md`](ORAL_DEFENSE_GUIDE.md)) sigue sirviendo para componentes, rutas y hooks. Lo que ya no es cierto de ella: los datos **no** viven en `localStorage` (ahora vienen de la API) y el login **no** es simulado.

## Antes de empezar (preparar el escenario)

- Abrir **dos ventanas** (una normal y una de incógnito) para tener dueño y trabajador a la vez.
- Tener una cuenta de dueño con el hato ya cargado (Configuración → "Cargar datos de demostración") para no depender de datos vacíos.
- Tener abierta la pestaña `/api/health` de la API desplegada y la consola de Atlas (Collections) por si piden ver la base de datos.
- Probar todo **desde la URL de Vercel**, no desde localhost, el día anterior.

## Demo (5 min)

| Min | Qué se hace | Qué se demuestra |
|---|---|---|
| 0:00 | Landing → "Regístrate" → crear cuenta de **dueño** con nombre de finca | Registro, JWT, entra al dashboard |
| 0:45 | **Animales**: agregar uno (con un arete que ya exista para mostrar el error 409, luego uno válido) | Feature 1: CRUD persistente. Recargar la página: sigue ahí |
| 1:45 | Entrar al animal → **registrar vacuna** → volver al dashboard: cambia el contador de alertas | Feature 2: vacunación y alertas |
| 2:45 | **Trazabilidad** → reporte del hato → exportar CSV (y un reporte de un solo animal) | Feature 3: trazabilidad para el ICA |
| 3:30 | **Configuración** → generar código → en la ventana de incógnito, registrarse como **trabajador** con ese código | Segundo rol |
| 4:15 | Como trabajador: no hay botón de eliminar ni zona de riesgo; finca en solo lectura. Luego, **con la consola/Postman**, mostrar que un `DELETE` con el token del trabajador devuelve **403** | Permisos en el **backend**, no solo ocultos |
| 4:45 | Como dueño: "Desvincular" al trabajador → en la otra ventana, recargar: lo manda a login | Revocación inmediata |

Plan B si falla la red: tener un video corto de este mismo recorrido y las respuestas 403 pegadas en un archivo.

## Arquitectura (5 min)

### Árbol de componentes (1 min)
`main.jsx` → `Theme > Toast > Confirm > Auth > Data > HashRouter/App`. Rutas públicas (`/`, `/contacto`, `/login`, `/registro`) y un `ProtectedRoute` que envuelve `AppShell` (sidebar + `Outlet`) con 6 páginas. Ninguna función de componente pasa de ~80 líneas: las páginas orquestan, los componentes de `components/<dominio>/` dibujan.

### Flujo de datos del cliente (1 min)
`AuthContext` guarda el usuario; al recargar verifica el token con `GET /auth/me` (mientras tanto `ProtectedRoute` muestra "Verificando sesión" para evitar parpadeo). `DataContext` carga animales, vacunas y finca cuando hay usuario; las escrituras pasan por `useDataActions`, que llama a la API y **solo si responde bien** actualiza el estado. `api.js` es el único que llama a `fetch`.

### Diseño de la API (1.5 min)
REST por recurso (`/animales`, `/vacunas`, `/fincas`, `/auth`, `/contacto`), JSON, códigos HTTP con significado (201 crea, 204 borra, 400 validación, 401 sin sesión, 403 sin permiso, 404 no existe/otra finca, 409 duplicado, 429 demasiados intentos). Cadena de middleware por petición: `helmet → cors → json → mongoSanitize → rateLimit → (conexión a Mongo) → authenticate → authorize → controller`. La tabla completa está en el README.

### Esquema de la base de datos (1 min)
`fincas` ←1:N→ `users`, `animals`, `vacunas`; `animals` ←1:N→ `vacunas`. Todo documento de negocio lleva `fincaId` (multi-tenencia en una sola base). Índice único `(fincaId, arete)`: el arete se puede repetir entre fincas, no dentro de una.

### Seguridad (30 s)
Ver la tabla del README. Frases clave: *"el rol sale de la base de datos en cada petición, no del token"*, *"el filtro por finca está en la consulta, no en la interfaz"*.

## Preguntas que probablemente hagan

- **¿Dónde se hace cumplir el permiso de eliminar?** En `routes/animales.js`: `authorize("dueno")` antes del controlador. El cliente solo oculta el botón. Demostrarlo con el 403.
- **¿Qué pasa si roban el token?** Mientras no expire (7 días) sirve; mitigamos con que rol y finca se revalidan en base de datos (si desvinculan al usuario, cae al instante). Mejora futura: cookie `HttpOnly` y tokens de vida corta con refresco.
- **¿Por qué el token está en `localStorage`?** Simplicidad con un cliente estático en otro dominio; el riesgo es XSS, por eso React escapa y el servidor además limpia HTML. Alternativa: cookie `HttpOnly` + CSRF.
- **¿Cómo evitan la inyección NoSQL?** `express-mongo-sanitize` quita claves con `$`, y además validamos que email/contraseña/filtros sean `string`; `{"email":{"$ne":null}}` devuelve 400. Pueden mostrarlo con `curl`.
- **¿Por qué `fincaId` no lo manda el cliente?** Porque si lo mandara, cualquiera podría escribir en otra finca. Sale del usuario autenticado en el servidor.
- **¿Qué hace el `useEffect` de `DataContext`? ¿Cuál es su array de dependencias?** `[userId, reloadKey]`: se re-ejecuta al cambiar de usuario (login/logout) o al pedir `reload()`. El cleanup marca `cancelled = true` para ignorar la respuesta de una carga vieja si el usuario cambió mientras llegaba. (Mismo patrón en `useApiData`, con dependencia `[path]`.)
- **¿Por qué dos proyectos en Vercel?** Cliente estático y API serverless tienen despliegues distintos; `server/api/index.js` exporta la app de Express sin `listen()` y `vercel.json` reescribe todo a esa función.
- **¿Por qué el rate limit podría no ser perfecto en Vercel?** Cada instancia serverless tiene su propia memoria; para un límite global haría falta un almacén compartido (Redis/Upstash).
- **¿Por qué los reportes se calculan en el cliente?** Decisión del equipo: los datos ya están cargados y el cálculo de vacunación vive en `domain.js`; evita duplicar la lógica en el servidor. Si el ICA necesitara consumirlos como API, se movería al backend.

## Trazado en vivo (practicar al menos uno)

**Crear un animal:** `AnimalForm` valida y llama `onSave` → `AnimalesPage.handleSave` → `upsertAnimal` (`useDataActions`) → `api.post("/animales")` → ruta `POST /api/animales` → `authenticate` (token → `req.user`) → `createAnimal`: `pickClean` (lista blanca + sin HTML) → `validateAnimal` → `Animal.create` con `fincaId` del token → `201` → el cliente hace `setAnimales` → tabla y dashboard se actualizan.

**Un 403:** trabajador pulsa algo de dueño (o se fuerza con curl) → `authenticate` pone `req.user.rol = "trabajador"` → `authorize("dueno")` responde `403` antes de llegar al controlador → `api.js` lanza `ApiError` → `attempt()` en `useDataActions` lo muestra como toast rojo.

## Checklist final de entrega

- [ ] URL de Vercel del cliente y de la API (ambas funcionan) pegadas en el README
- [ ] Repositorio con historial real de commits de **ambos** integrantes
- [ ] README completo (problema, solución, instalación, API)
- [ ] `figma-link.txt` actualizado, mostrando la evolución de wireframes a diseño final (incluir registro y trabajadores)
- [ ] `AI_LOG.md` completo de todo el proyecto
- [ ] Contraseña del usuario de Atlas cambiada a una fuerte, y `0.0.0.0/0` en Network Access para Vercel
