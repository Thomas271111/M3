import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";

/** Marco común de las pantallas de acceso (login y registro). */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2.5 focus-ring rounded-control mb-8">
          <span className="grid place-items-center size-9 rounded-full bg-primary-soft text-primary">
            <Icon name="logo" className="size-5" />
          </span>
          <span className="font-display font-semibold text-lg text-text">MiHato</span>
        </Link>

        <div className="rounded-card border border-border bg-surface shadow-lifted p-6 sm:p-8">
          <h1 className="font-display text-xl font-semibold text-text text-center">{title}</h1>
          <p className="text-sm text-text-muted text-center mt-1.5">{subtitle}</p>
          {children}
        </div>

        <div className="text-center text-sm text-text-muted mt-6 space-y-2">
          {footer}
          <p>
            <Link to="/" className="text-primary hover:underline focus-ring rounded">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function FormAlert({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}
