import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API de MiHato escuchando en http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("No se pudo iniciar el servidor:", err.message);
  process.exit(1);
}
