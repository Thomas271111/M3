import { useState } from "react";
import { FormField, inputClass } from "../ui/FormField.jsx";

const FIELDS = ["nombre", "propietario", "vereda", "municipio", "departamento", "codigoICA"];

export function FincaForm({ finca, readOnly = false, onSave }) {
  const [form, setForm] = useState(finca);
  const [nombreError, setNombreError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setNombreError("Ingresa el nombre de la finca.");
      return;
    }
    setNombreError("");
    setSaving(true);
    await onSave(Object.fromEntries(FIELDS.map((f) => [f, form[f]])));
    setSaving(false);
  }

  const field = (id, label) => (
    <FormField label={label} htmlFor={id} error={id === "nombre" ? nombreError : ""}>
      <input id={id} className={inputClass} value={form[id] ?? ""} onChange={(e) => update(id, e.target.value)} />
    </FormField>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-5">
      {/* fieldset disabled bloquea todos los campos de golpe para el trabajador (el servidor igual lo rechaza) */}
      <fieldset disabled={readOnly} className="space-y-4">
        {field("nombre", "Nombre de la finca")}
        {field("propietario", "Propietario(a)")}
        <div className="grid sm:grid-cols-2 gap-4">
          {field("vereda", "Vereda")}
          {field("municipio", "Municipio")}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {field("departamento", "Departamento")}
          {field("codigoICA", "Código ICA")}
        </div>
      </fieldset>
      {readOnly ? (
        <p className="mt-4 text-sm text-text-muted">Solo el dueño puede editar los datos de la finca.</p>
      ) : (
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}
    </form>
  );
}
