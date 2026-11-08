export const measurementTypes = [
  "pulse",
  "pressure",
  "temperature",
  "sugar",
  "weight",
] as const;

export type MeasurementType = (typeof measurementTypes)[number];

interface MeasurementBase {
  id: string;
  measuredAt: string;
  note: string;
}

interface ScalarMeasurement extends MeasurementBase {
  type: Exclude<MeasurementType, "pressure">;
  value: number;
}

interface PressureMeasurement extends MeasurementBase {
  type: "pressure";
  systolic: number;
  diastolic: number;
}

export type Measurement = ScalarMeasurement | PressureMeasurement;
export type NewMeasurement =
  Omit<ScalarMeasurement, "id"> | Omit<PressureMeasurement, "id">;

export function isMeasurementType(value: string): value is MeasurementType {
  return measurementTypes.some((type) => type === value);
}
