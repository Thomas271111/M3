const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// "2026-11-01" (sin hora) es una fecha de calendario: se interpreta en hora local.
// new Date("2026-11-01") la tomaría como medianoche UTC y en Colombia (UTC-5) mostraría el día anterior.
export function parseDate(value) {
  if (value instanceof Date) return value;
  const match = DATE_ONLY_RE.exec(String(value));
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Date(value);
}

// Date -> "YYYY-MM-DD" con los componentes locales (toISOString usaría UTC).
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  return parseDate(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatNumber(n) {
  return new Intl.NumberFormat("es-CO").format(n);
}

export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

const DIACRITICS_RE = new RegExp("[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]", "g");

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .toLowerCase();
}

export function todayISO() {
  return toISODate(new Date());
}
