import type { MeasurementType } from "./types";

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
