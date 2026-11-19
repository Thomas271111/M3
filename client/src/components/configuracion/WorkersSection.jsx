import { api } from "../../api.js";
import { useApiData } from "../../hooks/useApiData.js";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils.js";

export function WorkersSection() {
  const { data: trabajadores, setData, loading, error } = useApiData("/fincas/trabajadores", []);
  const confirm = useConfirm();
  const showToast = useToast();

  async function handleRemove(worker) {
    const ok = await confirm({
      title: "Desvincular trabajador",
      message: `${worker.email} perderá el acceso a tu finca y su cuenta se eliminará.`,
      confirmLabel: "Desvincular",
      danger: true
    });
    if (!ok) return;
    try {
      await api.del(`/fincas/trabajadores/${worker.id}`);
      setData((list) => list.filter((w) => w.id !== worker.id));
      showToast("Trabajador desvinculado.", "info");
    } catch (err) {
      showToast(err.message, "danger");
    }
  }

  return (
    <section aria-labelledby="trabajadores-heading" className="mt-6 rounded-card bg-surface border border-border shadow-soft p-5 sm:p-6">
      <h2 id="trabajadores-heading" className="font-display font-semibold text-text">
        Trabajadores
      </h2>
      <p className="text-sm text-text-muted mt-0.5">Pueden registrar animales y vacunas, pero no eliminar ni cambiar la finca.</p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {!loading && !error && trabajadores.length === 0 ? <p className="mt-4 text-sm text-text-muted">Aún no tienes trabajadores vinculados.</p> : null}
      <ul className="mt-3 divide-y divide-border">
        {trabajadores.map((w) => (
          <li key={w.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{w.email}</p>
              <p className="text-xs text-text-muted">Se unió el {formatDate(w.createdAt)}</p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(w)}
              className="focus-ring shrink-0 rounded-control border border-danger/40 px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-soft"
            >
              Desvincular
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
