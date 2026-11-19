import { useState, useEffect } from "react";
import { api } from "../api.js";

/**
 * Carga un recurso de la API al montar (y cada vez que cambia `path`).
 * - Dependencia [path]: es lo único externo que lee el efecto; si cambia, se pide otro recurso.
 * - Cleanup: marca la petición como obsoleta, así una respuesta tardía no escribe estado de
 *   un componente desmontado ni pisa la respuesta de un `path` más nuevo.
 */
export function useApiData(path, initial = null) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get(path)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, setData, loading, error };
}
