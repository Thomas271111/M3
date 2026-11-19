import { useState } from "react";
import { api } from "../../api.js";
import { Icon } from "../ui/Icon.jsx";
import { FormAlert } from "../auth/AuthLayout.jsx";
import { CONTACT_VALIDATORS } from "../../contactValidators.js";
import { ContactFormFields } from "./ContactFormFields.jsx";

const EMPTY_FORM = { nombre: "", correo: "", finca: "", cabezas: "" };

export function ContactForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: CONTACT_VALIDATORS[field](value) }));
  }

  function handleBlur(field) {
    setErrors((e) => ({ ...e, [field]: CONTACT_VALIDATORS[field](form[field]) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = Object.fromEntries(Object.keys(CONTACT_VALIDATORS).map((f) => [f, CONTACT_VALIDATORS[f](form[f])]));
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/contacto", {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        finca: form.finca.trim(),
        cabezas: Number(form.cabezas)
      });
      onSuccess(form.nombre.trim());
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <ContactFormFields form={form} errors={errors} onChange={update} onBlur={handleBlur} />
      <FormAlert message={formError} />
      <button
        type="submit"
        disabled={submitting}
        className="focus-ring w-full inline-flex items-center justify-center gap-2 rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
      >
        {submitting ? "Enviando…" : "Enviar datos"}
        <Icon name="arrowRight" className="size-4" />
      </button>
      <p className="text-xs text-text-muted text-center">Usaremos tus datos solo para contactarte sobre MiHato.</p>
    </form>
  );
}
