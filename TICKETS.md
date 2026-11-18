# Tickets Milestone 3 — MiHato (Full-Stack)

Stack: React (`client/`) + Express (`server/`) + MongoDB Atlas + JWT, desplegado en Vercel.
Roles: **Dueño** (control total de su finca) y **Trabajador** (permisos limitados, vinculado con código de invitación).
Integrantes: **Thomas** (tickets impares, 38) y **Daniel** (tickets pares, 37). Los tickets se **alternan** dentro de cada bloque, así ambos participan en todas las áreas del proyecto.

**Cómo usarlos:** cada ticket es una tarjeta de Trello, pero se pueden desarrollar varios juntos. Los tickets están agrupados en **bloques temáticos** (no pertenecen a una sola persona). Cada quien hace commit de sus propios tickets, en uno o varios commits. El mensaje de commit sugerido está al inicio de cada lote y debe nombrar los tickets que incluye.

Formato de cada ticket: **Descripción** · **Criterios** · **Integración** (con qué se conecta) · **Depende de**.

## Matriz de permisos

| Acción | Dueño | Trabajador |
|---|---|---|
| Ver animales, vacunas, reportes | Sí | Sí |
| Crear / editar animales y vacunas | Sí | Sí |
| Eliminar animales / vacunas | Sí | No |
| Editar la finca / resetear datos | Sí | No |
| Código de invitación, ver/desvincular trabajadores | Sí | No |

Todo dato lleva `fincaId`; un usuario solo ve datos de su finca.

---

# BLOQUE 1 — Estructura del monorepo
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `chore: reestructurar proyecto como monorepo (T01-T03)`

### T01 — Renombrar carpeta local M2 a M3 · **Thomas**
- **Descripción:** Cerrar editor/sesión y renombrar la carpeta `M2` a `M3` a mano.
- **Criterios:** la carpeta se llama `M3`, `git status` sigue funcionando.
- **Integración:** el repo remoto no cambia. **Depende de:** nada.

### T02 — Mover el frontend a `client/` · **Daniel**
- **Descripción:** Con `git mv`, mover `src/`, `index.html`, `vite.config.js`, `eslint.config.js`, `package.json` y `package-lock.json` a `client/`.
- **Criterios:** `npm install` y `npm run dev` funcionan dentro de `client/`.
- **Integración:** deja la raíz libre para `server/`. **Depende de:** T01.

### T03 — Ajustar raíz del repo · **Thomas**
- **Descripción:** Actualizar `.gitignore` (`node_modules`, `.env`, `dist`) y la carpeta de salida del build; poner versión 3.0.0 en `client/package.json`.
- **Criterios:** `npm run build` en `client/` genera la salida sin errores; `.env` ignorado.
- **Integración:** afecta el despliegue (T63). **Depende de:** T02.

---

# BLOQUE 2 — Servidor Express base
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): servidor Express base (T04-T08)`

### T04 — Crear `server/` e instalar dependencias · **Daniel**
- **Descripción:** `npm init` en `server/` e instalar express, mongoose, dotenv, cors, helmet, bcryptjs, jsonwebtoken, nodemon (dev). Scripts `dev` y `start`.
- **Criterios:** `npm run dev` arranca sin errores.
- **Integración:** base de todos los tickets de servidor. **Depende de:** T02.

### T05 — Crear `app.js` con middlewares básicos · **Thomas**
- **Descripción:** Express con `express.json({ limit })`, `cors` (origen `CLIENT_URL`) y `helmet`.
- **Criterios:** las cabeceras de helmet aparecen; solo el origen del cliente pasa CORS.
- **Integración:** al app se le montan todas las rutas después. **Depende de:** T04.

### T06 — Ruta `GET /api/health` · **Daniel**
- **Descripción:** Responde `{ ok: true }`.
- **Criterios:** responde 200.
- **Integración:** sirve para comprobar el despliegue (T65). **Depende de:** T05.

### T07 — Manejador de errores y ruta 404 · **Thomas**
- **Descripción:** Middleware que devuelve `{ message }` en JSON y oculta el stack en producción.
- **Criterios:** ruta inexistente devuelve 404 en JSON; error interno devuelve 500 sin stack en producción.
- **Integración:** los controladores usan `next(err)`. **Depende de:** T05.

### T08 — Archivo `.env.example` · **Daniel**
- **Descripción:** Documentar `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`.
- **Criterios:** existe, sin valores reales.
- **Integración:** se cita en el README (T71). **Depende de:** T04.

---

# BLOQUE 3 — Conexión y modelos de MongoDB
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): conexión a Atlas y modelos (T09-T13)`

### T09 — Conexión a MongoDB Atlas · **Thomas**
- **Descripción:** Archivo `config/db.js` con Mongoose usando `MONGODB_URI`; el servidor arranca solo si conecta.
- **Criterios:** conecta a Atlas; si falla, muestra mensaje claro y termina.
- **Integración:** lo llama `server.js`. **Depende de:** T05.

### T10 — Modelo `Finca` · **Daniel**
- **Descripción:** Campos nombre, ubicación, código ICA, `codigoInvitacion`.
- **Criterios:** nombre requerido; se crea un documento de prueba.
- **Integración:** campos equivalentes a `DEFAULT_FINCA`. **Depende de:** T09.

### T11 — Modelo `User` · **Thomas**
- **Descripción:** email (único), `passwordHash`, `rol` (`dueno` | `trabajador`), `fincaId`.
- **Criterios:** email único; rol solo acepta los dos valores.
- **Integración:** lo usan auth y roles. **Depende de:** T10.

### T12 — Modelo `Animal` · **Daniel**
- **Descripción:** Campos del `AnimalForm` actual (arete, nombre, sexo, categoría, raza, fecha de nacimiento, peso, potrero, estado, notas) + `fincaId`.
- **Criterios:** arete único por finca; enums de sexo y estado.
- **Integración:** debe coincidir con el formulario del cliente. **Depende de:** T10.

### T13 — Modelo `Vacuna` · **Thomas**
- **Descripción:** `animalId`, tipo, fecha de aplicación, próxima dosis, `fincaId`.
- **Criterios:** requiere `animalId` y fecha.
- **Integración:** alimenta alertas (`domain.js`). **Depende de:** T12.

---

# BLOQUE 4 — Autenticación JWT
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): registro, login y middleware JWT (T14-T19)`

### T14 — Utilidades de contraseña y token · **Daniel**
- **Descripción:** Funciones para hashear/comparar con bcrypt y firmar/verificar JWT con `userId`, `rol`, `fincaId`.
- **Criterios:** el token expira según `JWT_EXPIRES_IN`.
- **Integración:** las usan T15, T16, T17. **Depende de:** T11.

### T15 — `POST /api/auth/register` (dueño) · **Thomas**
- **Descripción:** Crea la finca y el usuario dueño; devuelve token.
- **Criterios:** email repetido devuelve 409; contraseña nunca se devuelve.
- **Integración:** lo consume T46. **Depende de:** T14.

### T16 — `POST /api/auth/login` · **Daniel**
- **Descripción:** Verifica credenciales y devuelve token y usuario.
- **Criterios:** credenciales malas devuelven 401 con mensaje genérico.
- **Integración:** lo consume T45. **Depende de:** T14.

### T17 — Middleware `authenticate` · **Thomas**
- **Descripción:** Lee `Authorization: Bearer`, verifica el token y pone `req.user`.
- **Criterios:** sin token o token inválido devuelve 401.
- **Integración:** protege todas las rutas de datos. **Depende de:** T14.

### T18 — `GET /api/auth/me` · **Daniel**
- **Descripción:** Devuelve el usuario autenticado (sin hash).
- **Criterios:** con token válido devuelve email, rol y finca.
- **Integración:** lo usa `AuthContext` al recargar (T44). **Depende de:** T17.

### T19 — Validación de datos de auth en servidor · **Thomas**
- **Descripción:** Replicar reglas de `authValidators.js` (formato de email, largo de contraseña) en register y login.
- **Criterios:** datos inválidos devuelven 400 con mensaje por campo.
- **Integración:** mismas reglas que el cliente. **Depende de:** T15.

---

# BLOQUE 5 — Roles e invitaciones
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): roles y vinculación de trabajadores (T20-T24)`

### T20 — Middleware `authorize(...roles)` · **Daniel**
- **Descripción:** Permite solo los roles indicados; si no, 403.
- **Criterios:** un trabajador en una ruta de dueño recibe 403.
- **Integración:** se aplica en T29, T33, T35, T36, T21-T24. **Depende de:** T17.

### T21 — `POST /api/fincas/invitacion` · **Thomas**
- **Descripción:** El dueño genera o renueva el código de invitación de su finca.
- **Criterios:** solo dueño; el código anterior deja de servir.
- **Integración:** lo muestra T59. **Depende de:** T20.

### T22 — `POST /api/auth/register-worker` · **Daniel**
- **Descripción:** Registra un trabajador con email, contraseña y código; queda vinculado a esa finca.
- **Criterios:** código inválido devuelve 400; el rol queda `trabajador`.
- **Integración:** lo consume T47. **Depende de:** T21.

### T23 — `GET /api/fincas/trabajadores` · **Thomas**
- **Descripción:** Lista los trabajadores de la finca del dueño.
- **Criterios:** solo dueño; no devuelve hashes.
- **Integración:** lo muestra T60. **Depende de:** T20.

### T24 — `DELETE /api/fincas/trabajadores/:id` · **Daniel**
- **Descripción:** Desvincula y elimina al trabajador.
- **Criterios:** solo dueño; no puede borrar usuarios de otra finca (404).
- **Integración:** botón en T60. **Depende de:** T23.

---

# BLOQUE 6 — API de animales
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): CRUD de animales (T25-T29)`

### T25 — `GET /api/animales` con filtros · **Thomas**
- **Descripción:** Lista animales de la finca; filtros por estado, potrero y búsqueda.
- **Criterios:** solo devuelve animales de la finca del token.
- **Integración:** equivale a `useFilteredAnimales`. **Depende de:** T17, T12.

### T26 — `GET /api/animales/:id` · **Daniel**
- **Descripción:** Devuelve un animal.
- **Criterios:** animal de otra finca devuelve 404.
- **Integración:** alimenta `AnimalDetailPage`. **Depende de:** T25.

### T27 — `POST /api/animales` · **Thomas**
- **Descripción:** Crea un animal con `fincaId` del token.
- **Criterios:** arete repetido devuelve 409; campos inválidos 400; responde 201.
- **Integración:** reemplaza `upsertAnimal` (alta). **Depende de:** T25.

### T28 — `PUT /api/animales/:id` · **Daniel**
- **Descripción:** Edita un animal.
- **Criterios:** no permite cambiar `fincaId`; otra finca devuelve 404.
- **Integración:** reemplaza `upsertAnimal` (edición). **Depende de:** T27.

### T29 — `DELETE /api/animales/:id` · **Thomas**
- **Descripción:** Elimina un animal y sus vacunas.
- **Criterios:** solo dueño (trabajador recibe 403); también borra sus vacunas.
- **Integración:** reemplaza `deleteAnimal`. **Depende de:** T20, T27.

---

# BLOQUE 7 — API de vacunas
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): CRUD de vacunas (T30-T33)`

### T30 — `GET /api/vacunas` · **Daniel**
- **Descripción:** Lista vacunas de la finca; opcional `?animalId=`.
- **Criterios:** solo de la finca del token.
- **Integración:** alimenta `VacunacionPage` y alertas. **Depende de:** T13, T17.

### T31 — `POST /api/vacunas` · **Thomas**
- **Descripción:** Registra una vacuna.
- **Criterios:** el animal debe pertenecer a la misma finca; responde 201.
- **Integración:** reemplaza `upsertVacuna` (alta). **Depende de:** T30.

### T32 — `PUT /api/vacunas/:id` · **Daniel**
- **Descripción:** Edita una vacuna.
- **Criterios:** otra finca devuelve 404.
- **Integración:** reemplaza `upsertVacuna` (edición). **Depende de:** T31.

### T33 — `DELETE /api/vacunas/:id` · **Thomas**
- **Descripción:** Elimina una vacuna.
- **Criterios:** solo dueño.
- **Integración:** reemplaza `deleteVacuna`. **Depende de:** T20, T31.

---

# BLOQUE 8 — Finca y reportes
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): finca y reportes de trazabilidad (T34-T38)`

### T34 — `GET /api/fincas/mi-finca` · **Daniel**
- **Descripción:** Devuelve la finca del usuario.
- **Criterios:** accesible a ambos roles.
- **Integración:** alimenta `ConfiguracionPage`. **Depende de:** T17.

### T35 — `PUT /api/fincas/mi-finca` · **Thomas**
- **Descripción:** Edita nombre, ubicación y código ICA.
- **Criterios:** solo dueño.
- **Integración:** reemplaza `setFinca`. **Depende de:** T34, T20.

### T36 — `POST /api/fincas/reset-demo` · **Daniel**
- **Descripción:** Borra los animales y vacunas de la finca y carga datos de ejemplo.
- **Criterios:** solo dueño.
- **Integración:** reemplaza `resetDemoData` (`DangerZone`). **Depende de:** T35.

### T37 — `GET /api/reportes/hato` · **Thomas**
- **Descripción:** Devuelve el listado completo del hato con su estado de vacunación.
- **Criterios:** mismos campos que usa `csvExport.js`.
- **Integración:** `HatoReport`. **Depende de:** T25, T30.

### T38 — `GET /api/reportes/animal/:id` · **Daniel**
- **Descripción:** Devuelve la ficha de un animal con su historial de vacunas.
- **Criterios:** otra finca devuelve 404.
- **Integración:** `AnimalReport`. **Depende de:** T37.

---

# BLOQUE 9 — Seguridad del backend
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(server): sanitización, validación y rate limit (T39-T42)`

### T39 — Protección contra inyección NoSQL · **Thomas**
- **Descripción:** Instalar `express-mongo-sanitize` (o equivalente) y montarlo en `app.js`.
- **Criterios:** `{"email": {"$ne": null}}` en login es rechazado o neutralizado.
- **Integración:** middleware global. **Depende de:** T05.

### T40 — Validación de entrada en animales y vacunas · **Daniel**
- **Descripción:** Validar tipos y rangos (peso numérico, fechas válidas, enums) en POST/PUT.
- **Criterios:** datos inválidos devuelven 400 y no llegan a la base.
- **Integración:** rutas de T27, T28, T31, T32. **Depende de:** T27, T31.

### T41 — Limpieza contra XSS · **Thomas**
- **Descripción:** Escapar o limpiar strings libres (nombre, notas, potrero) antes de guardarlos.
- **Criterios:** un nombre con `<script>` no se ejecuta al mostrarse en el cliente.
- **Integración:** afecta la tabla y el detalle del cliente. **Depende de:** T40.

### T42 — Rate limit en login y registro · **Daniel**
- **Descripción:** Limitar intentos por IP con `express-rate-limit`.
- **Criterios:** tras N intentos seguidos devuelve 429.
- **Integración:** rutas de auth. **Depende de:** T16.

---

# BLOQUE 10 — Cliente: autenticación real
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(client): login y registro con JWT (T43-T48)`

### T43 — Módulo `api.js` · **Thomas**
- **Descripción:** Función `request` con `VITE_API_URL`, cabecera `Authorization` y manejo de errores JSON.
- **Criterios:** un 401 dispara el cierre de sesión.
- **Integración:** lo usan todos los tickets de cliente. **Depende de:** T16.

### T44 — `AuthContext` con JWT · **Daniel**
- **Descripción:** Guardar token, cargar usuario con `/me` al iniciar y exponer `user.rol`, `login`, `logout`.
- **Criterios:** recargar la página mantiene la sesión; logout borra el token.
- **Integración:** consumido por `ProtectedRoute` y T56-T58. **Depende de:** T43, T18.

### T45 — `LoginPage` contra la API · **Thomas**
- **Descripción:** Enviar email y contraseña al backend; mostrar errores.
- **Criterios:** login correcto redirige a `/dashboard`; error se muestra en el formulario.
- **Integración:** usa `LoginFormFields`. **Depende de:** T44.

### T46 — Registro de dueño · **Daniel**
- **Descripción:** Formulario de registro (email, contraseña, nombre de finca).
- **Criterios:** crea cuenta y entra al dashboard.
- **Integración:** `POST /api/auth/register`. **Depende de:** T45, T15.

### T47 — Registro de trabajador con código · **Thomas**
- **Descripción:** Formulario con email, contraseña y código de invitación.
- **Criterios:** código válido entra a la finca; inválido muestra error.
- **Integración:** `POST /api/auth/register-worker`. **Depende de:** T45, T22.

### T48 — `ProtectedRoute` con sesión real · **Daniel**
- **Descripción:** Esperar a que se cargue el usuario antes de decidir; redirigir a `/login` si no hay sesión.
- **Criterios:** sin token redirige; no hay parpadeo al recargar.
- **Integración:** envuelve las rutas de `App.jsx`. **Depende de:** T44.

---

# BLOQUE 11 — Cliente: datos desde la API
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(client): DataContext conectado a la API (T49-T55)`

### T49 — Cargar animales desde la API · **Thomas**
- **Descripción:** `DataContext` obtiene `GET /api/animales` al iniciar sesión.
- **Criterios:** la tabla muestra datos de MongoDB.
- **Integración:** misma interfaz `useAppData`. **Depende de:** T43, T25.

### T50 — Crear, editar y eliminar animales vía API · **Daniel**
- **Descripción:** `upsertAnimal` y `deleteAnimal` llaman a la API y actualizan el estado.
- **Criterios:** los cambios persisten tras recargar.
- **Integración:** `AnimalModal`, `useAnimalDetailActions`. **Depende de:** T49, T27-T29.

### T51 — Vacunas vía API · **Thomas**
- **Descripción:** Cargar y mutar vacunas con los endpoints de T30-T33.
- **Criterios:** alertas y contadores (`useAlertCount`, `useVaccinationCounts`) siguen funcionando.
- **Integración:** `VacunacionPage`. **Depende de:** T49, T30-T33.

### T52 — Finca y configuración vía API · **Daniel**
- **Descripción:** Cargar la finca y guardar cambios; zona de peligro llama a `reset-demo`.
- **Criterios:** los datos de la finca persisten.
- **Integración:** `FincaForm`, `DangerZone`. **Depende de:** T49, T34-T36.

### T53 — Trazabilidad desde reportes del servidor · **Thomas**
- **Descripción:** Los reportes de hato y animal usan los endpoints de reportes.
- **Criterios:** exportar CSV sigue funcionando.
- **Integración:** `HatoReport`, `AnimalReport`, `csvExport.js`. **Depende de:** T37, T38.

### T54 — Estados de carga y error · **Daniel**
- **Descripción:** Mostrar indicador de carga y avisos de error con `ToastContext`.
- **Criterios:** un fallo de red muestra aviso, no pantalla en blanco.
- **Integración:** páginas con datos. **Depende de:** T50.

### T55 — Retirar datos locales · **Thomas**
- **Descripción:** Eliminar `seedData` del cliente y el uso de `useLocalStorage` para animales, vacunas y finca (puede quedar para el tema).
- **Criterios:** no quedan datos de negocio en `localStorage`; lint y build limpios.
- **Integración:** cumple "sin datos en memoria" de la rúbrica. **Depende de:** T49-T53.

---

# BLOQUE 12 — Cliente: roles en la interfaz
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat(client): permisos por rol y gestión de trabajadores (T56-T60)`

### T56 — Mostrar el rol · **Daniel**
- **Descripción:** Mostrar rol y finca del usuario en `Topbar`/`Sidebar`.
- **Criterios:** aparece "Dueño" o "Trabajador".
- **Integración:** `useAuth().user.rol`. **Depende de:** T44.

### T57 — Ocultar eliminar al trabajador · **Thomas**
- **Descripción:** No mostrar botones de eliminar animal y vacuna si el rol es trabajador.
- **Criterios:** si se forzara la petición, el 403 se muestra como aviso.
- **Integración:** `AnimalRow`, `AnimalDetailHeader`, historial de vacunas. **Depende de:** T56.

### T58 — Restringir configuración · **Daniel**
- **Descripción:** Formulario de finca y zona de peligro solo editables para el dueño.
- **Criterios:** el trabajador ve la finca en solo lectura.
- **Integración:** `ConfiguracionPage`. **Depende de:** T56.

### T59 — Generar código de invitación · **Thomas**
- **Descripción:** Sección en Configuración (solo dueño) con botón para generar y copiar el código.
- **Criterios:** el código se muestra y se copia.
- **Integración:** `POST /api/fincas/invitacion`. **Depende de:** T58, T21.

### T60 — Listar y desvincular trabajadores · **Daniel**
- **Descripción:** Lista de trabajadores con botón de desvincular (con `ConfirmContext`).
- **Criterios:** al desvincular desaparece de la lista y pierde acceso.
- **Integración:** endpoints T23 y T24. **Depende de:** T59.

---

# BLOQUE 13 — Contacto
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `feat: formulario de contacto (T61)`

### T61 — Formulario de contacto · **Thomas**
- **Descripción:** Decidir si se guarda en backend (`POST /api/contacto`, modelo y ruta pública con rate limit) o se mantiene local.
- **Criterios:** decisión documentada y funcionando; sin errores en consola.
- **Integración:** `ContactForm`. **Depende de:** T42.

---

# BLOQUE 14 — Despliegue en Vercel
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `chore: despliegue en Vercel (T62-T65)`

### T62 — Configurar el servidor para Vercel · **Daniel**
- **Descripción:** `server/vercel.json` y exportar la app para entorno serverless.
- **Criterios:** la API responde en la URL de Vercel.
- **Integración:** `app.js`. **Depende de:** T06.

### T63 — Desplegar el cliente · **Thomas**
- **Descripción:** Proyecto de Vercel para `client/` con `VITE_API_URL` apuntando a la API; mantener `HashRouter`.
- **Criterios:** el cliente abre en la URL pública.
- **Integración:** build de T03. **Depende de:** T62.

### T64 — Variables de entorno y Atlas · **Daniel**
- **Descripción:** Cargar variables en Vercel y permitir en Atlas las IPs de Vercel.
- **Criterios:** sin secretos en el repo; la API conecta a Atlas en producción.
- **Integración:** `.env.example` (T08). **Depende de:** T62.

### T65 — Prueba de extremo a extremo en producción · **Thomas**
- **Descripción:** Registrar dueño, crear animal, vincular trabajador y probar permisos en la URL pública.
- **Criterios:** todo funciona desde otro dispositivo.
- **Integración:** cierra el despliegue. **Depende de:** T63, T64.

---

# BLOQUE 15 — Auditoría de seguridad
Mensaje de commit sugerido (cada integrante commitea solo sus propios tickets del bloque): `test: auditoría de seguridad y correcciones (T66-T69)`

### T66 — Pruebas de XSS e inyección NoSQL · **Daniel**
- **Descripción:** Probar scripts en campos de texto e inyección de operadores en login y filtros.
- **Criterios:** resultados anotados en una lista; ningún ataque funciona.
- **Integración:** verifica T39 y T41. **Depende de:** T65.

### T67 — Pruebas de escalada de rol · **Thomas**
- **Descripción:** Con token de trabajador, llamar endpoints de dueño (DELETE, configuración, invitación).
- **Criterios:** todos devuelven 403.
- **Integración:** verifica T20. **Depende de:** T65.

### T68 — Pruebas de acceso entre fincas · **Daniel**
- **Descripción:** Con la cuenta de una finca, pedir IDs de otra finca.
- **Criterios:** siempre 404.
- **Integración:** verifica el `fincaId`. **Depende de:** T65.

### T69 — Corregir hallazgos · **Thomas**
- **Descripción:** Arreglar lo que falle en T66-T68 y revisar cabeceras de helmet.
- **Criterios:** lista de pruebas toda en verde.
- **Integración:** rúbrica de seguridad. **Depende de:** T66-T68.

---

# BLOQUE 16 — Documentación
Cada integrante commitea sus tickets, p. ej. `docs: README (T71)` y `docs: bitácora y Figma (T74)`. Se pueden avanzar durante todo el proyecto.

### T70 — README: problema y solución (Thomas) · **Daniel**
- **Descripción:** Problema, usuarios, roles y funcionalidades.
- **Criterios:** se entiende el proyecto sin abrir el código.

### T71 — README: instalación (Thomas) · **Thomas**
- **Descripción:** Pasos para levantar cliente y servidor, variables de entorno y URLs de despliegue.
- **Criterios:** una persona nueva lo levanta solo con el README.

### T72 — README: tabla de API (Thomas) · **Daniel**
- **Descripción:** Método, ruta, rol requerido y ejemplo de cada endpoint.
- **Criterios:** cubre todos los endpoints de T15-T38.

### T73 — Actualizar `AI_LOG.md` (Daniel) · **Thomas**
- **Descripción:** Agregar las sesiones de M3 y las decisiones tomadas con ayuda de IA.
- **Criterios:** cubre todo el proyecto.

### T74 — Actualizar `figma-link.txt` (Daniel) · **Daniel**
- **Descripción:** Enlace de Figma que muestre la evolución de wireframes a diseño final.
- **Criterios:** el enlace abre y muestra las pantallas nuevas (registro, trabajadores).

### T75 — Guion de Demo Day (Daniel) · **Thomas**
- **Descripción:** Adaptar `ORAL_DEFENSE_GUIDE.md`: demo de 3 funcionalidades, árbol de componentes, diseño de API y esquema de la base de datos.
- **Criterios:** cabe en 5 min de demo y 5 min de arquitectura.

---

## Decisiones abiertas
1. ¿El formulario de contacto va al backend (T61)?
2. ¿El cálculo de vacunas vive solo en el cliente o también en el servidor? (hoy queda en el cliente)
3. ¿El trabajador puede ver los reportes de trazabilidad completos? (hoy sí, en la matriz)
