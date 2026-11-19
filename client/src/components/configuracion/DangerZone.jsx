import { Icon } from "../ui/Icon.jsx";
import { useAppData } from "../../context/DataContext.jsx";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function DangerZone() {
  const { resetDemoData } = useAppData();
  const confirm = useConfirm();
  const showToast = useToast();

  async function handleReset() {
    const ok = await confirm({
      title: "Cargar datos de demostración",
      message: "Se eliminarán todos los animales y vacunas de tu finca y se reemplazarán por datos de ejemplo. No se puede deshacer.",
      confirmLabel: "Reemplazar datos",
      danger: true
    });
    if (ok && (await resetDemoData())) showToast("Datos de demostración cargados.", "info");
  }

  return (
    <section aria-labelledby="danger-heading" className="mt-6 rounded-card border border-danger/30 bg-danger-soft/40 p-5 sm:p-6">
      <h2 id="danger-heading" className="font-display font-semibold text-danger">
        Zona de riesgo
      </h2>
      <p className="text-sm text-text-muted mt-0.5">
        Reemplaza el hato de tu finca por datos de demostración. Es útil para probar MiHato; esta acción no se puede deshacer.
      </p>
      <button
        type="button"
        onClick={handleReset}
        className="focus-ring mt-4 inline-flex items-center gap-2 rounded-control border border-danger/40 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger-soft"
      >
        <Icon name="trash" className="size-4.5" /> Cargar datos de demostración
      </button>
    </section>
  );
}
