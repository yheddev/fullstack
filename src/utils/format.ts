import type { Measurement } from "../types/measurement";

const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 10,
});

export function formatValue(measurement: Measurement): string {
  if (measurement.type === "pressure") {
    return `${numberFormat.format(measurement.systolic)}/${numberFormat.format(measurement.diastolic)}`;
  }
  return numberFormat.format(measurement.value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function sortMeasurements(measurements: Measurement[]): Measurement[] {
  return [...measurements].sort(
    (a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt),
  );
}

export function toLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseLocalDateTime(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getFullYear() < 1) return null;
  // Date может перенести несуществующее 31 февраля на март.
  return toLocalDateTime(date) === value ? date : null;
}
