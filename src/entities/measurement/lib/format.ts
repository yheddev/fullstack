import type { Measurement } from "../model/types";

const numberFormat = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 10,
});

export function formatValue(measurement: Measurement): string {
  if (measurement.type === "pressure") {
    return `${numberFormat.format(measurement.systolic)}/${numberFormat.format(measurement.diastolic)}`;
  }
  return numberFormat.format(measurement.value);
}

export function sortMeasurements(measurements: Measurement[]): Measurement[] {
  return [...measurements].sort(
    (a, b) => Date.parse(b.measuredAt) - Date.parse(a.measuredAt),
  );
}
