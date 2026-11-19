import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api.js";
import { useAuth } from "./AuthContext.jsx";
import { useDataActions } from "../hooks/useDataActions.js";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [animales, setAnimales] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [finca, setFinca] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Se vuelve a ejecutar al cambiar de usuario (login/logout) o al pedir reload().
  // El cleanup descarta la respuesta de una carga vieja si el usuario cambió mientras llegaba.
  useEffect(() => {
    if (!userId) {
      setAnimales([]);
      setVacunas([]);
      setFinca(null);
      setStatus("loading");
      return undefined;
    }
    let cancelled = false;
    setStatus((s) => (s === "ready" ? s : "loading")); // en una recarga no se tapa la pantalla con el spinner
    Promise.all([api.get("/animales"), api.get("/vacunas"), api.get("/fincas/mi-finca")])
      .then(([a, v, f]) => {
        if (cancelled) return;
        setAnimales(a);
        setVacunas(v);
        setFinca(f);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);

  const actions = useDataActions({ setAnimales, setVacunas, setFinca, reload });

  const value = { animales, vacunas, finca, status, reload, ...actions };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAppData debe usarse dentro de <DataProvider>");
  return ctx;
}
