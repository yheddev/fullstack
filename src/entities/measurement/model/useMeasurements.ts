import { useEffect, useState } from "react";
import { loadMeasurements } from "../api/loadMeasurements";
import type { Measurement, NewMeasurement } from "./types";

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadMeasurements(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setMeasurements(data);
        setStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError("Не удалось загрузить журнал. Проверьте подключение и повторите попытку.");
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  function retry() {
    setError("");
    setStatus("loading");
    setAttempt((previous) => previous + 1);
  }

  function add(measurement: NewMeasurement) {
    setMeasurements((previous) => [{ ...measurement, id: crypto.randomUUID() }, ...previous]);
  }

  function update(id: string, measurement: NewMeasurement) {
    setMeasurements((previous) => previous.map((item) =>
      item.id === id ? { ...measurement, id } : item,
    ));
  }

  function remove(id: string) {
    setMeasurements((previous) => previous.filter((item) => item.id !== id));
  }

  return { measurements, status, error, retry, add, update, remove };
}
