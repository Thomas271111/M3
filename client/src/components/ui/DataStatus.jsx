import { Icon } from "./Icon.jsx";

export function LoadingBlock({ label = "Cargando…" }) {
  return (
    <div role="status" className="flex-1 grid place-items-center py-24 text-text-muted">
      <div className="flex items-center gap-3 text-sm">
        <Icon name="spinner" className="size-5 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function ErrorBlock({ onRetry }) {
  return (
    <div role="alert" className="flex-1 grid place-items-center px-6 py-24 text-center">
      <div>
        <span className="inline-grid place-items-center size-12 rounded-full bg-danger-soft text-danger mb-3">
          <Icon name="alertTriangle" className="size-5" />
        </span>
        <p className="text-sm font-medium text-text">No pudimos cargar tus datos</p>
        <p className="text-sm text-text-muted mt-1">Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-4 rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
