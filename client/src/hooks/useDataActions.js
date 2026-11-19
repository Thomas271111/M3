import { api } from "../api.js";
import { useToast } from "../context/ToastContext.jsx";

const replaceOrAdd = (list, saved) =>
  list.some((item) => item.id === saved.id) ? list.map((item) => (item.id === saved.id ? saved : item)) : [...list, saved];

/**
 * Operaciones de escritura contra la API. Cada una devuelve true/false: si falla, ya mostró el aviso
 * (incluido el 403 cuando un trabajador intenta algo de dueño) y el componente solo decide si cierra el modal.
 */
export function useDataActions({ setAnimales, setVacunas, setFinca, reload }) {
  const showToast = useToast();

  async function attempt(fn) {
    try {
      await fn();
      return true;
    } catch (err) {
      showToast(err.message, "danger");
      return false;
    }
  }

  return {
    upsertAnimal: (animal) =>
      attempt(async () => {
        const { id, ...data } = animal;
        const saved = id ? await api.put(`/animales/${id}`, data) : await api.post("/animales", data);
        setAnimales((list) => replaceOrAdd(list, saved));
      }),

    deleteAnimal: (id) =>
      attempt(async () => {
        await api.del(`/animales/${id}`);
        setAnimales((list) => list.filter((a) => a.id !== id));
        setVacunas((list) => list.filter((v) => v.animalId !== id)); // el servidor también las borra
      }),

    upsertVacuna: (vacuna) =>
      attempt(async () => {
        const { id, ...data } = vacuna;
        const saved = id ? await api.put(`/vacunas/${id}`, data) : await api.post("/vacunas", data);
        setVacunas((list) => replaceOrAdd(list, saved));
      }),

    deleteVacuna: (id) =>
      attempt(async () => {
        await api.del(`/vacunas/${id}`);
        setVacunas((list) => list.filter((v) => v.id !== id));
      }),

    saveFinca: (data) => attempt(async () => setFinca(await api.put("/fincas/mi-finca", data))),

    resetDemoData: () =>
      attempt(async () => {
        await api.post("/fincas/reset-demo");
        reload();
      })
  };
}
