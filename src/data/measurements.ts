import type { Measurement, MeasurementType } from "../types/measurement";

export const measurementInfo: Record<
  MeasurementType,
  {
    label: string;
    unit: string;
    color: string;
    background: string;
  }
> = {
  pulse: {
    label: "Пульс",
    unit: "уд/мин",
    color: "#b45d7b",
    background: "#fbeef3",
  },
  pressure: {
    label: "Давление",
    unit: "мм рт. ст.",
    color: "#8061b9",
    background: "#f1ecfa",
  },
  temperature: {
    label: "Температура",
    unit: "°C",
    color: "#b47a4b",
    background: "#fcf2e7",
  },
  sugar: {
    label: "Сахар крови",
    unit: "ммоль/л",
    color: "#528d8c",
    background: "#eaf5f3",
  },
  weight: { label: "Вес", unit: "кг", color: "#657fbc", background: "#eef2fb" },
};

export function createDemoMeasurements(): Measurement[] {
  const now = Date.now();
  const ago = (minutes: number) =>
    new Date(now - minutes * 60_000).toISOString();

  return [
    {
      id: "demo-1",
      type: "pulse",
      value: 72,
      measuredAt: ago(25),
      note: "Утреннее измерение",
    },
    {
      id: "demo-2",
      type: "pressure",
      systolic: 120,
      diastolic: 80,
      measuredAt: ago(55),
      note: "После отдыха",
    },
    {
      id: "demo-3",
      type: "temperature",
      value: 36.6,
      measuredAt: ago(80),
      note: "",
    },
    {
      id: "demo-4",
      type: "sugar",
      value: 5.1,
      measuredAt: ago(105),
      note: "До завтрака",
    },
    {
      id: "demo-5",
      type: "weight",
      value: 68.4,
      measuredAt: ago(130),
      note: "Утром",
    },
    {
      id: "demo-6",
      type: "pulse",
      value: 76,
      measuredAt: ago(1450),
      note: "Вечерняя запись",
    },
    {
      id: "demo-7",
      type: "pressure",
      systolic: 118,
      diastolic: 78,
      measuredAt: ago(1480),
      note: "",
    },
    {
      id: "demo-8",
      type: "temperature",
      value: 36.5,
      measuredAt: ago(1510),
      note: "",
    },
    {
      id: "demo-9",
      type: "weight",
      value: 68.6,
      measuredAt: ago(1600),
      note: "Утром",
    },
    {
      id: "demo-10",
      type: "sugar",
      value: 5.3,
      measuredAt: ago(1650),
      note: "До завтрака",
    },
  ];
}
