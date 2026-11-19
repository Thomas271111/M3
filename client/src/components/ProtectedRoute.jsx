import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingBlock } from "./ui/DataStatus.jsx";

/**
 * Ruta de layout: espera a que se verifique el token (evita el parpadeo al recargar), y si no hay
 * sesión redirige a /login guardando la ubicación pedida para volver ahí después de iniciar sesión.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-dvh flex">
        <LoadingBlock label="Verificando sesión…" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
