import { FormField, inputClass } from "../ui/FormField.jsx";

/** Campo propio de cada tipo de registro: nombre de la finca (dueño) o código de invitación (trabajador). */
export function RegisterExtraField({ mode, values, errors, onChange, onBlur }) {
  if (mode === "dueno") {
    return (
      <FormField label="Nombre de tu finca" htmlFor="fincaNombre" required error={errors.fincaNombre}>
        <input
          id="fincaNombre"
          value={values.fincaNombre}
          onChange={(e) => onChange("fincaNombre", e.target.value)}
          onBlur={(e) => onBlur("fincaNombre", e.target.value)}
          className={inputClass}
          placeholder="Ej. Finca La Esperanza"
          autoComplete="organization"
        />
      </FormField>
    );
  }
  return (
    <FormField label="Código de invitación" htmlFor="codigo" required error={errors.codigo}>
      <input
        id="codigo"
        value={values.codigo}
        onChange={(e) => onChange("codigo", e.target.value)}
        onBlur={(e) => onBlur("codigo", e.target.value)}
        className={`${inputClass} uppercase tracking-wider`}
        placeholder="Ej. A1B2C3D4E5"
        autoComplete="off"
      />
    </FormField>
  );
}

const TABS = [
  { id: "dueno", label: "Soy dueño" },
  { id: "trabajador", label: "Soy trabajador" }
];

export function RegisterModeTabs({ mode, onChange }) {
  return (
    <div role="group" aria-label="Tipo de cuenta" className="mt-5 grid grid-cols-2 gap-1 rounded-control bg-surface-alt p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={mode === tab.id}
          onClick={() => onChange(tab.id)}
          className={`focus-ring rounded-control px-3 py-2 text-sm font-medium ${
            mode === tab.id ? "bg-surface text-text shadow-soft" : "text-text-muted hover:text-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
