import { Topbar } from "../components/layout/Topbar.jsx";
import { useAppData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { FincaForm } from "../components/configuracion/FincaForm.jsx";
import { ThemeSwitch } from "../components/configuracion/ThemeSwitch.jsx";
import { DangerZone } from "../components/configuracion/DangerZone.jsx";
import { InvitationSection } from "../components/configuracion/InvitationSection.jsx";
import { WorkersSection } from "../components/configuracion/WorkersSection.jsx";

export function ConfiguracionPage() {
  const { finca, saveFinca } = useAppData();
  const { isOwner } = useAuth();
  const showToast = useToast();

  async function handleSave(data) {
    if (await saveFinca(data)) showToast("Datos de la finca actualizados.", "success");
  }

  return (
    <>
      <Topbar title="Configuración" subtitle="Datos de la finca y preferencias" />
      <main id="main-content" className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-10 outline-none max-w-2xl">
        <section aria-labelledby="finca-heading" className="rounded-card bg-surface border border-border shadow-soft p-5 sm:p-6">
          <h2 id="finca-heading" className="font-display font-semibold text-text">
            Datos de la finca
          </h2>
          <p className="text-sm text-text-muted mt-0.5">Esta información aparece en los reportes de trazabilidad.</p>
          <FincaForm finca={finca} readOnly={!isOwner} onSave={handleSave} />
        </section>

        {isOwner ? (
          <>
            <InvitationSection />
            <WorkersSection />
          </>
        ) : null}

        <section aria-labelledby="pref-heading" className="mt-6 rounded-card bg-surface border border-border shadow-soft p-5 sm:p-6">
          <h2 id="pref-heading" className="font-display font-semibold text-text">
            Preferencias
          </h2>
          <ThemeSwitch />
        </section>

        {isOwner ? <DangerZone /> : null}
      </main>
    </>
  );
}
