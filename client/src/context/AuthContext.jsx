import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Si hay un token guardado, hay que verificarlo con /me antes de decidir si hay sesión.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  useEffect(() => {
    if (!getToken()) return undefined;
    let cancelled = false;
    api
      .get("/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        /* un 401 ya cerró la sesión vía el handler; un fallo de red deja al usuario en /login */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function authenticate(path, body) {
    const data = await api.post(path, body);
    setToken(data.token);
    setUser(data.user);
  }

  const value = {
    user,
    loading,
    isOwner: user?.rol === "dueno",
    login: (email, password) => authenticate("/auth/login", { email, password }),
    register: (email, password, fincaNombre) => authenticate("/auth/register", { email, password, fincaNombre }),
    registerWorker: (email, password, codigo) => authenticate("/auth/register-worker", { email, password, codigo }),
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
