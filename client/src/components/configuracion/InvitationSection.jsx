import { useState } from "react";
import { api } from "../../api.js";
import { useApiData } from "../../hooks/useApiData.js";
import { useConfirm } from "../../context/ConfirmContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export function InvitationSection() {
  const { data, setData, loading, error } = useApiData("/fincas/invitacion");
  const confirm = useConfirm();
  const showToast = useToast();
  const [busy, setBusy] = useState(false);
  const codigo = data?.codigoInvitacion;

  async function handleGenerate() {
    if (codigo) {
      const ok = await confirm({
        title: "Renovar código",
        message: "El código actual dejará de funcionar. Los trabajadores que ya se unieron no se ven afectados.",
        confirmLabel: "Renovar"
      });
      if (!ok) return;
    }
    setBusy(true);
    try {
      setData(await api.post("/fincas/invitacion"));
      showToast("Código de invitación generado.", "success");
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codigo);
      showToast("Código copiado.", "success");
    } catch {
      showToast("No se pudo copiar; selecciona el código y cópialo a mano.", "danger");
    }
  }

  return (
    <section aria-labelledby="invitacion-heading" className="mt-6 rounded-card bg-surface border border-border shadow-soft p-5 sm:p-6">
      <h2 id="invitacion-heading" className="font-display font-semibold text-text">
        Invitar trabajadores
      </h2>
      <p className="text-sm text-text-muted mt-0.5">
        Comparte este código con tu mayordomo. Lo usará en “Soy trabajador” al crear su cuenta.
      </p>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <output className="min-w-44 rounded-control border border-dashed border-border bg-surface-alt px-4 py-2.5 font-mono text-sm tracking-widest text-text">
          {loading ? "…" : codigo || "Sin código"}
        </output>
        {codigo ? (
          <button type="button" onClick={handleCopy} className="focus-ring rounded-control border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-surface-alt">
            Copiar
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={busy || loading}
          className="focus-ring rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {codigo ? "Renovar código" : "Generar código"}
        </button>
      </div>
    </section>
  );
}
