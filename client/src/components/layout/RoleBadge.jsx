import { useAuth } from "../../context/AuthContext.jsx";

/** Muestra el rol de la sesión: el servidor es quien lo hace cumplir, esto solo lo vuelve visible. */
export function RoleBadge({ className = "" }) {
  const { isOwner } = useAuth();
  return (
    <span className={`inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary ${className}`}>
      {isOwner ? "Dueño" : "Trabajador"}
    </span>
  );
}
