// Datos de demostración (los mismos del prototipo M2) para POST /api/fincas/reset-demo.
function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function proximaAftosa(fecha) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + 182);
  return d.toISOString().slice(0, 10);
}

const ANIMALES = [
  { arete: "COR-0231", nombre: "Lucero", sexo: "M", raza: "Brahman", categoria: "Toro", estado: "Activo", potrero: "Potrero La Loma", pesoKg: 620, dias: 1460, notas: "Reproductor principal." },
  { arete: "COR-0245", nombre: "Canela", sexo: "H", raza: "Cebú", categoria: "Vaca", estado: "Activo", potrero: "Potrero 1", pesoKg: 480, dias: 1825, notas: "" },
  { arete: "COR-0246", nombre: "Estrella", sexo: "H", raza: "Gyr", categoria: "Vaca", estado: "Activo", potrero: "Potrero 1", pesoKg: 455, dias: 2100, notas: "Buena producción de leche." },
  { arete: "COR-0250", nombre: "", sexo: "H", raza: "Romosinuano", categoria: "Novilla", estado: "Activo", potrero: "Potrero 2", pesoKg: 310, dias: 760, notas: "" },
  { arete: "COR-0251", nombre: "", sexo: "M", raza: "Romosinuano", categoria: "Novillo", estado: "Activo", potrero: "Potrero 2", pesoKg: 340, dias: 790, notas: "" },
  { arete: "COR-0260", nombre: "Paloma", sexo: "H", raza: "Cebú", categoria: "Vaca", estado: "Activo", potrero: "Potrero Bajo", pesoKg: 470, dias: 1900, notas: "" },
  { arete: "COR-0261", nombre: "", sexo: "H", raza: "Cebú", categoria: "Ternera", estado: "Activo", potrero: "Potrero Bajo", pesoKg: 95, dias: 120, notas: "Cría de Paloma." },
  { arete: "COR-0270", nombre: "Trueno", sexo: "M", raza: "Angus", categoria: "Toro", estado: "Activo", potrero: "Potrero La Loma", pesoKg: 705, dias: 1600, notas: "" },
  { arete: "COR-0281", nombre: "Morena", sexo: "H", raza: "Pardo Suizo", categoria: "Vaca", estado: "Activo", potrero: "Potrero 1", pesoKg: 500, dias: 2400, notas: "" },
  { arete: "COR-0282", nombre: "", sexo: "H", raza: "Pardo Suizo", categoria: "Novilla", estado: "Activo", potrero: "Potrero 1", pesoKg: 290, dias: 560, notas: "" },
  { arete: "COR-0290", nombre: "Capitán", sexo: "M", raza: "Simmental", categoria: "Novillo", estado: "Activo", potrero: "Potrero 2", pesoKg: 380, dias: 900, notas: "En engorde." },
  { arete: "COR-0291", nombre: "", sexo: "M", raza: "Simmental", categoria: "Novillo", estado: "Activo", potrero: "Potrero 2", pesoKg: 365, dias: 870, notas: "En engorde." },
  { arete: "COR-0300", nombre: "Reina", sexo: "H", raza: "Holstein", categoria: "Vaca", estado: "Activo", potrero: "Potrero Bajo", pesoKg: 520, dias: 2000, notas: "" },
  { arete: "COR-0301", nombre: "", sexo: "H", raza: "Holstein", categoria: "Ternera", estado: "Activo", potrero: "Potrero Bajo", pesoKg: 78, dias: 60, notas: "Cría de Reina." },
  { arete: "COR-0188", nombre: "Sultán", sexo: "M", raza: "Brahman", categoria: "Toro", estado: "Vendido", potrero: "—", pesoKg: 680, dias: 2600, notas: "Vendido en feria de marzo." },
  { arete: "COR-0310", nombre: "", sexo: "H", raza: "Cebú", categoria: "Novilla", estado: "Activo", potrero: "Corral de manejo", pesoKg: 300, dias: 620, notas: "En observación por cojera leve." },
  { arete: "COR-0311", nombre: "Golondrina", sexo: "H", raza: "Romosinuano", categoria: "Vaca", estado: "Activo", potrero: "Potrero 1", pesoKg: 490, dias: 2200, notas: "" },
  { arete: "COR-0071", nombre: "Viejo Toro", sexo: "M", raza: "Cebú", categoria: "Toro", estado: "Muerto", potrero: "—", pesoKg: 0, dias: 4200, notas: "Falleció por causas naturales, oct 2025." }
];

export function buildSeedAnimales(fincaId) {
  return ANIMALES.map(({ dias, ...a }) => ({ ...a, fincaId, fechaNacimiento: isoDaysAgo(dias), fechaRegistro: isoDaysAgo(30) }));
}

// Recibe los animales ya guardados (con _id) y devuelve las vacunas a insertar.
export function buildSeedVacunas(fincaId, animales) {
  const veterinario = "Dra. Camila Restrepo";
  const base = { fincaId, veterinario, notas: "" };
  const diasPorPatron = [200, 160, 20];
  const loteAftosa = ["AF-2201", "AF-2214", "AF-2240"];
  const vacunas = [];

  animales
    .filter((a) => a.estado === "Activo")
    .forEach((a, i) => {
      const patron = i % 4;
      if (patron < 3) {
        const fecha = isoDaysAgo(diasPorPatron[patron]);
        vacunas.push({ ...base, animalId: a._id, tipo: "aftosa", fecha, fechaProximaDosis: proximaAftosa(fecha), lote: loteAftosa[patron], fechaRegistro: fecha });
      }
      if (a.categoria === "Vaca" || a.categoria === "Novilla") {
        const fecha = isoDaysAgo(500);
        vacunas.push({ ...base, animalId: a._id, tipo: "brucelosis", fecha, fechaProximaDosis: null, lote: "BR-1187", notas: "Dosis única.", fechaRegistro: fecha });
      }
    });

  return vacunas;
}
