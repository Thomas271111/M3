import { useState } from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LOGIN_VALIDATORS } from "../authValidators.js";
import { AuthLayout, FormAlert } from "../components/auth/AuthLayout.jsx";
import { LoginFormFields } from "../components/auth/LoginFormFields.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión (o se acaba de iniciar), vuelve a donde el usuario quería ir.
  if (user) return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;

  function handleChange(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: LOGIN_VALIDATORS[field](value) }));
  }

  function handleBlur(field, value) {
    setErrors((e) => ({ ...e, [field]: LOGIN_VALIDATORS[field](value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = { email: LOGIN_VALIDATORS.email(values.email), password: LOGIN_VALIDATORS.password(values.password) };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setSubmitting(true);
    setFormError("");
    try {
      await login(values.email.trim(), values.password);
    } catch (err) {
      setFormError(err.message);
      setSubmitting(false);
    }
  }

  const footer = (
    <p>
      ¿Aún no tienes cuenta?{" "}
      <Link to="/registro" className="text-primary font-medium hover:underline focus-ring rounded">
        Regístrate
      </Link>
    </p>
  );

  return (
    <AuthLayout title="Inicia sesión" subtitle="Entra a tu finca con tu correo y contraseña." footer={footer}>
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <LoginFormFields {...values} errors={errors} onChange={handleChange} onBlur={handleBlur} />
        <FormAlert message={formError} />
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring w-full rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
