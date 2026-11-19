// Punto de entrada serverless de Vercel: exporta la app de Express sin llamar a listen().
import { app } from "../src/app.js";

export default app;
