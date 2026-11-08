import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import type { NewMeasurement } from "./types/measurement";
import { createDemoMeasurements } from "./data/measurements";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import NewMeasurementPage from "./pages/NewMeasurementPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const [measurements, setMeasurements] = useState(createDemoMeasurements);
  const [notificationOpen, setNotificationOpen] = useState(false);

  function addMeasurement(measurement: NewMeasurement) {
    setMeasurements((previous) => [
      { ...measurement, id: crypto.randomUUID() },
      ...previous,
    ]);
    setNotificationOpen(true);
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage measurements={measurements} />} />
        <Route
          path="/measurements"
          element={<HistoryPage measurements={measurements} />}
        />
        <Route
          path="/measurements/new"
          element={<NewMeasurementPage onAdd={addMeasurement} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Snackbar
        open={notificationOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotificationOpen(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotificationOpen(false)}
        >
          Измерение сохранено и добавлено в историю.
        </Alert>
      </Snackbar>
    </Layout>
  );
}
