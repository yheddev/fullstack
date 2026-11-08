import { isMeasurementType } from "../model/types";
import type { Measurement } from "../model/types";

// JSON содержит учебные записи с возрастом в минутах, а не настоящие данные.
export async function loadMeasurements(signal: AbortSignal): Promise<Measurement[]> {
  const response = await fetch("/demo/measurements.json", { signal });
  if (!response.ok) throw new Error("Не удалось загрузить журнал. Попробуйте ещё раз.");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Не удалось прочитать данные журнала.");
  const now = Date.now();
  const ids = new Set<string>();

  return data.map((item: unknown) => {
    if (
      typeof item !== "object" || item === null ||
      !("id" in item) || typeof item.id !== "string" || !item.id || ids.has(item.id) ||
      !("type" in item) || typeof item.type !== "string" || !isMeasurementType(item.type) ||
      !("note" in item) || typeof item.note !== "string" || item.note.length > 500 ||
      !("minutesAgo" in item) || typeof item.minutesAgo !== "number" ||
      !Number.isFinite(item.minutesAgo) || item.minutesAgo < 0
    ) throw new Error("Не удалось прочитать данные журнала.");

    ids.add(item.id);
    const date = new Date(now - item.minutesAgo * 60_000);
    if (!Number.isFinite(date.getTime())) throw new Error("Некорректная дата в журнале.");
    const common = { id: item.id, note: item.note, measuredAt: date.toISOString() };
    if (item.type === "pressure") {
      if (!("systolic" in item) || !("diastolic" in item) ||
          !positiveNumber(item.systolic) || !positiveNumber(item.diastolic) ||
          !Number.isSafeInteger(item.systolic) || !Number.isSafeInteger(item.diastolic)) {
        throw new Error("Некорректное давление в журнале.");
      }
      return { ...common, type: item.type, systolic: item.systolic, diastolic: item.diastolic };
    }
    if (!("value" in item) || !positiveNumber(item.value) ||
        (item.type === "pulse" && !Number.isSafeInteger(item.value))) {
      throw new Error("Некорректное значение в журнале.");
    }
    return { ...common, type: item.type, value: item.value };
  });
}

function positiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
