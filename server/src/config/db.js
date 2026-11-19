import dns from "node:dns";
import mongoose from "mongoose";

// Opcional, solo desarrollo: algunas redes/VPN dejan a Node con un DNS local que no resuelve
// registros SRV (error "querySrv ECONNREFUSED"). Ej.: DNS_SERVERS=8.8.8.8,1.1.1.1
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()));

let connecting = null;

// Idempotente: server.js la llama al arrancar y app.js antes de cada petición
// (en Vercel las funciones se reutilizan en caliente, así que casi siempre ya está conectada).
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Falta MONGODB_URI en las variables de entorno");
    connecting = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then(() => console.log("Conectado a MongoDB Atlas"))
      .catch((err) => {
        connecting = null; // permite reintentar en la siguiente petición
        throw err;
      });
  }
  await connecting;
}
