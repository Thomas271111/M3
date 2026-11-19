import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { REGISTER_VALIDATORS, REGISTER_FIELDS } from "../authValidators.js";
import { AuthLayout, FormAlert } from "../components/auth/AuthLayout.jsx";
import { LoginFormFields } from "../components/auth/LoginFormFields.jsx";
import { RegisterExtraField, RegisterModeTabs } from "../components/auth/RegisterExtraField.jsx";

const EMPTY = { email: "", password: "", fincaNombre: "", codigo: "" };

export function RegisterPage() {
  const { user, register, registerWorker } = useAuth();
  const [mode, setMode] = useState("dueno");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: REGISTER_VALIDATORS[field](value) }));
  }

  function handleBlur(field, value) {
    setErrors((e) => ({ ...e, [field]: REGISTER_VALIDATORS[field](value) }));
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = Object.fromEntries(REGISTER_FIELDS[mode].map((f) => [f, REGISTER_VALIDATORS[f](values[f])]));
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    setFormError("");
    try {
      const email = values.email.trim();
      if (mode === "dueno") await register(email, values.password, values.fincaNombre.trim());
      else await registerWorker(email, values.password, values.codigo.trim());
    } catch (err) {
      setFormError(err.message);
      if (err.errors) setErrors(err.errors);
      setSubmitting(false);
    }
  }

  const footer = (
    <p>
      ¿Ya tienes cuenta?{" "}
      <Link to="/login" className="text-primary font-medium hover:underline focus-ring rounded">
        Inicia sesión
      </Link>
    </p>
  );

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Registra tu finca o únete a una con un código." footer={footer}>
      <RegisterModeTabs mode={mode} onChange={switchMode} />
      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
        <LoginFormFields {...values} errors={errors} onChange={handleChange} onBlur={handleBlur} isNewAccount />
        <RegisterExtraField mode={mode} values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />
        <FormAlert message={formError} />
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}
