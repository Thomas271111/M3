# MiHato — control digital de hato para fincas ganaderas

**Autores:** Thomas Andrés Rincón y Daniel Ortiz · Proyecto de Diseño y Arquitectura Web, Milestone 3 (full-stack).

| | URL |
|---|---|
| Cliente (Vercel) | https://m3-virid.vercel.app |
| API (Vercel) | https://mihato.vercel.app (estado: [`/api/health`](https://mihato.vercel.app/api/health) responde `{"ok":true}`) |
| Figma | ver [`figma-link.txt`](figma-link.txt) |
| Bitácora de uso de IA | [`AI_LOG.md`](AI_LOG.md) |

## 1. El problema

En las fincas ganaderas pequeñas y medianas de Colombia (50–300 cabezas) el hato se controla con cuadernos, Excel o de memoria. Eso produce tres problemas concretos: **conteos imprecisos**, **fechas de vacunación perdidas** (Fiebre Aftosa y Brucelosis son de control obligatorio ante el ICA) y **ausencia de trazabilidad** cuando el ICA o un comprador pide el historial sanitario. El detalle está en [`PROBLEM_STATEMENT.md`](PROBLEM_STATEMENT.md).

**Por qué una aplicación web:** el dueño la usa desde el computador de la oficina y el mayordomo desde el celular en el potrero, sin instalar nada; y los datos son **compartidos entre varias personas** (dueño y trabajadores ven el mismo hato en tiempo real). Una hoja de Excel no puede dar permisos distintos por persona ni historial confiable; una app móvil nativa obligaría a instalar y mantener dos versiones.

## 2. La solución

MiHato reemplaza el cuaderno por un sistema con cuatro funcionalidades demostrables de punta a punta:

1. **Registro de animales** — alta, edición y baja de cada cabeza (arete, categoría, raza, peso, potrero, estado…).
2. **Vacunación con alertas** — registro de dosis y cálculo de próximas dosis, con estados "vencida", "próxima" o "al día".
3. **Trazabilidad** — reportes del hato completo o de un animal, exportables a CSV o imprimibles, listos para el ICA.
4. **Gestión de equipo** — el dueño invita trabajadores con un código y puede desvincularlos.

### Roles y permisos

| Acción | Dueño | Trabajador |
|---|:-:|:-:|
| Ver animales, vacunas, reportes | ✅ | ✅ |
| Crear / editar animales y vacunas | ✅ | ✅ |
| Eliminar animales / vacunas | ✅ | ❌ |
| Editar la finca, cargar datos de demostración | ✅ | ❌ |
| Código de invitación, ver / desvincular trabajadores | ✅ | ❌ |

Los permisos **se hacen cumplir en el servidor** (middleware `authorize`, responde `403`); la interfaz solo oculta los botones por comodidad. Todo dato lleva `fincaId` y un usuario solo accede a los de su finca (cualquier id de otra finca responde `404`).

## 3. Cómo probarlo

1. Abre https://m3-virid.vercel.app y entra en **Probar la plataforma** → **Regístrate** → *Soy dueño* (correo, contraseña de 8+ caracteres con letra y número, y nombre de la finca).
2. Una finca nueva empieza **vacía**. En **Configuración → Zona de riesgo → Cargar datos de demostración** se cargan 18 animales con sus vacunas de ejemplo.
3. Recorre Dashboard, Animales, Vacunación y Trazabilidad (exporta el CSV).
4. En **Configuración → Invitar trabajadores** genera un código. En una ventana privada, regístrate con *Soy trabajador* usando ese código: verás los mismos datos, pero sin botones de eliminar ni zona de riesgo (y la API responde `403` si lo intentas por fuera de la interfaz).

## 4. Arquitectura

```
client/  React 18 + Vite + React Router (HashRouter) + Tailwind v4   → Vercel (proyecto 1)
server/  Express 4 + Mongoose + JWT + helmet                         → Vercel (proyecto 2, funciones serverless)
         MongoDB Atlas (colecciones: fincas, users, animals, vacunas, contactos)
```

- **Cliente:** el estado global vive en Context (`AuthContext`, `DataContext`, `ToastContext`, `ConfirmContext`, `ThemeContext`). Toda llamada HTTP pasa por [`client/src/api.js`](client/src/api.js), que agrega el JWT y cierra la sesión si el servidor responde `401`. `DataContext` carga animales, vacunas y finca desde la API al iniciar sesión; las escrituras (`useDataActions`) llaman a la API y solo entonces actualizan el estado.
- **Servidor:** `routes/` → `controllers/` → `models/`, con `middleware/` (`authenticate`, `authorize`, `rateLimit`, `errorHandler`) y `validators/` (el servidor nunca confía en el cliente).
- **Reportes de trazabilidad:** se arman en el cliente a partir de los datos ya traídos de la API (el cálculo de vacunación vive en `client/src/domain.js`).
- **Fechas:** las fechas de calendario (`YYYY-MM-DD`) se interpretan en hora local (`parseDate` en `client/src/utils.js`), para que no se muestren un día antes en zonas horarias al oeste de UTC.

### Esquema de la base de datos

| Colección | Campos principales |
|---|---|
| `fincas` | `nombre`, `propietario`, `vereda`, `municipio`, `departamento`, `codigoICA`, `unidadPeso`, `codigoInvitacion` (único; **oculto por defecto**, solo lo lee el dueño) |
| `users` | `email` (único), `passwordHash` (bcrypt, oculto), `rol` (`dueno` \| `trabajador`), `fincaId` |
| `animals` | `fincaId`, `arete` (único **por finca**), `nombre`, `sexo`, `categoria`, `raza`, `fechaNacimiento`, `pesoKg`, `potrero`, `estado`, `notas`, `fechaRegistro` |
| `vacunas` | `fincaId`, `animalId`, `tipo`, `fecha`, `fechaProximaDosis`, `lote`, `veterinario`, `notas`, `fechaRegistro` |
| `contactos` | `nombre`, `correo`, `finca`, `cabezas` (formulario público de la landing) |

## 5. Instalación local

Requisitos: Node 18+ y un cluster de MongoDB Atlas (el plan gratuito sirve).

```bash
# 1. API
cd server
npm install
cp .env.example .env        # completa MONGODB_URI y JWT_SECRET (instrucciones dentro del archivo)
npm run dev                 # http://localhost:4000/api/health

# 2. Cliente (otra terminal)
cd client
npm install
cp .env.example .env.local  # VITE_API_URL=http://localhost:4000/api
npm run dev                 # http://localhost:5173
```

En Atlas: crea un usuario de base de datos y, en **Network Access**, permite tu IP (para Vercel, `0.0.0.0/0`, porque sus IPs de salida no son fijas).

### Variables de entorno

| Dónde | Variable | Descripción |
|---|---|---|
| server | `MONGODB_URI` | Cadena de conexión de Atlas, con el nombre de la base (`/mihato`) |
| server | `JWT_SECRET` | Secreto de firma, mínimo 16 caracteres (el servidor se niega a firmar sin él) |
| server | `JWT_EXPIRES_IN` | Vida del token, por defecto `7d` |
| server | `CLIENT_URL` | Origen(es) permitidos por CORS, separados por coma. En producción: `https://m3-virid.vercel.app` (sin barra final) |
| server | `PORT` | Solo local, por defecto `4000` |
| server | `DNS_SERVERS` | Opcional, solo local (ver `.env.example`) |
| client | `VITE_API_URL` | URL base de la API **incluyendo `/api`**, sin barra final. En producción: `https://mihato.vercel.app/api`. Es obligatoria: si falta, la app muestra un error claro en vez de llamar a `localhost` |
| server | `NODE_ENV` | Vercel la fija en `production`. Opcional `development` solo para ver el stack de errores en local |

## 6. Despliegue en Vercel (dos proyectos)

1. **API:** importa el repositorio en Vercel, *Root Directory* = `server`. Define `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (la URL del cliente, que se conoce después: vuelve y edítala). `server/vercel.json` reescribe todas las rutas a `server/api/index.js`, que exporta la app de Express. Quedó en https://mihato.vercel.app.
2. **Cliente:** otro proyecto, *Root Directory* = `client`, framework Vite. Define `VITE_API_URL=https://mihato.vercel.app/api`. Se mantiene `HashRouter`, así que no hace falta configurar reescrituras. Quedó en https://m3-virid.vercel.app.
3. Vuelve al proyecto de la API, actualiza `CLIENT_URL` con la URL real del cliente y **redespliega** (las variables solo se leen al desplegar).
4. Comprueba: `GET https://mihato.vercel.app/api/health` → `{"ok":true}`; registra un dueño desde el cliente, crea un animal e invita a un trabajador.

> La contraseña del usuario de Atlas debe ser fuerte antes de desplegar; nunca se sube al repositorio (`.env` está en `.gitignore`).

## 7. Documentación de la API

Base: `https://mihato.vercel.app/api`. Autenticación: cabecera `Authorization: Bearer <token>`. Errores: `{ "message": "...", "errors": { campo: "mensaje" } }`.

| Método | Ruta | Rol | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/health` | público | Estado del servicio | 200 |
| POST | `/auth/register` | público | Crea finca + dueño. Body: `email`, `password`, `fincaNombre` | 201 `{token,user,finca}` · 400 · 409 correo repetido |
| POST | `/auth/register-worker` | público | Crea trabajador con código. Body: `email`, `password`, `codigo` | 201 · 400 código inválido · 409 |
| POST | `/auth/login` | público | Body: `email`, `password` | 200 · 401 (mensaje genérico) |
| GET | `/auth/me` | autenticado | Usuario y finca de la sesión | 200 · 401 |
| GET | `/animales` | ambos | Lista de la finca. Query opcional: `estado`, `potrero`, `q` (arete/nombre) | 200 · 400 |
| GET | `/animales/:id` | ambos | Un animal | 200 · 404 |
| POST | `/animales` | ambos | Crea animal | 201 · 400 · 409 arete repetido |
| PUT | `/animales/:id` | ambos | Edita animal (no cambia `fincaId`) | 200 · 400 · 404 · 409 |
| DELETE | `/animales/:id` | **dueño** | Elimina el animal **y sus vacunas** | 204 · 403 · 404 |
| GET | `/vacunas` | ambos | Lista de la finca. Query opcional: `animalId` | 200 · 400 |
| POST | `/vacunas` | ambos | Registra vacuna (el animal debe ser de la finca) | 201 · 400 · 404 |
| PUT | `/vacunas/:id` | ambos | Edita vacuna | 200 · 400 · 404 |
| DELETE | `/vacunas/:id` | **dueño** | Elimina vacuna | 204 · 403 · 404 |
| GET | `/fincas/mi-finca` | ambos | Datos de la finca (sin código de invitación) | 200 |
| PUT | `/fincas/mi-finca` | **dueño** | Edita nombre, ubicación y código ICA | 200 · 400 · 403 |
| GET | `/fincas/invitacion` | **dueño** | Código de invitación vigente (o `null`) | 200 · 403 |
| POST | `/fincas/invitacion` | **dueño** | Genera/renueva el código (el anterior deja de servir) | 200 · 403 |
| GET | `/fincas/trabajadores` | **dueño** | Trabajadores de la finca | 200 · 403 |
| DELETE | `/fincas/trabajadores/:id` | **dueño** | Desvincula y elimina al trabajador | 204 · 403 · 404 |
| POST | `/fincas/reset-demo` | **dueño** | Reemplaza animales y vacunas por datos de ejemplo | 200 `{animales,vacunas}` · 403 |
| POST | `/contacto` | público | Formulario de la landing: `nombre`, `correo`, `finca`, `cabezas` | 201 · 400 · 429 |

Ejemplo:

```bash
API=https://mihato.vercel.app/api
curl -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"dueno@ejemplo.com","password":"Clave1234"}'
# → { "token": "eyJ...", "user": { "id": "...", "email": "...", "rol": "dueno", "fincaId": "..." }, "finca": { ... } }
```

## 8. Seguridad

| Riesgo | Medida |
|---|---|
| Inyección NoSQL | `express-mongo-sanitize` global; validación de tipos (los filtros y credenciales deben ser `string`, un `{"$ne":null}` responde 400); `q` se escapa antes de usarse como regex |
| XSS | React escapa al renderizar; además el servidor elimina etiquetas HTML y caracteres de control de todo texto libre antes de guardarlo (`utils/sanitize.js`) |
| Cabeceras | `helmet` activo (CSP, HSTS, `X-Content-Type-Options`, etc.) |
| Autenticación | contraseñas con bcrypt; JWT con algoritmo fijado a HS256; el rol y la finca se leen **de la base de datos** en cada petición, así que desvincular a un trabajador le quita el acceso al instante |
| Autorización | `authorize("dueno")` en el servidor; `fincaId` siempre del token, nunca del body; ids de otra finca → 404 |
| Mass assignment | lista blanca de campos en cada POST/PUT (`pickClean`) |
| Fuerza bruta | `express-rate-limit`: 20 fallos / 15 min en login y registros (frena adivinar contraseñas o códigos de invitación), 5 envíos / hora en contacto, 300 / 15 min global |
| Fuga de datos | `passwordHash` y `codigoInvitacion` no se serializan; el login no distingue "correo inexistente" de "contraseña errónea"; el stack de errores solo se muestra con `NODE_ENV=development` (si la variable falta, no se filtra nada) |
| Abuso de entrada | cuerpo JSON limitado a 100 KB; correo ≤ 254 y contraseña ≤ 128 caracteres (evita cargar a bcrypt con cadenas enormes) |

**Auditoría de dependencias:** `npm audit --omit=dev` da 0 vulnerabilidades en cliente y servidor. Queda una alerta moderada en `nodemon` → `minimatch` (solo desarrollo, no se despliega) que el registro de npm aún no ofrece corregir.

**Limitaciones conocidas (para ser honestos en la defensa):** el contador del rate limit vive en memoria, así que en Vercel es por instancia y no global; el token se guarda en `localStorage` (si hubiera un XSS podría leerse; la alternativa sería una cookie `HttpOnly`); no hay verificación de correo ni recuperación de contraseña.

## 9. Estructura del repositorio

```
client/src/   api.js · context/ · hooks/ · pages/ · components/ · domain.js
server/src/   app.js · server.js · config/ · routes/ · controllers/ · models/ · middleware/ · validators/ · utils/
server/api/   index.js (entrada serverless de Vercel)
```

Comandos: `npm run lint` y `npm run build` en `client/`; `npm run dev` / `npm start` en `server/`.