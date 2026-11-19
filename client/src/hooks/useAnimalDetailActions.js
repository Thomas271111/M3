import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/DataContext.jsx";
import { useConfirm } from "../context/ConfirmContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export function useAnimalDetailActions(animal) {
  const navigate = useNavigate();
  const { deleteAnimal, deleteVacuna } = useAppData();
  const confirm = useConfirm();
  const showToast = useToast();

  async function handleDeleteAnimal() {
    const ok = await confirm({
      title: "Eliminar animal",
      message: `Esta acción eliminará a "${animal.nombre || animal.arete}" y todo su historial de vacunación. No se puede deshacer.`,
      confirmLabel: "Eliminar",
      danger: true
    });
    if (!ok || !(await deleteAnimal(animal.id))) return;
    showToast("Animal eliminado del hato.", "info");
    navigate("/animales");
  }

  async function handleDeleteVacuna(vacunaId) {
    const ok = await confirm({
      title: "Eliminar registro de vacuna",
      message: "Se eliminará este registro del historial de vacunación.",
      confirmLabel: "Eliminar",
      danger: true
    });
    if (!ok) return;
    if (await deleteVacuna(vacunaId)) showToast("Registro de vacuna eliminado.", "info");
  }

  return { handleDeleteAnimal, handleDeleteVacuna };
}
