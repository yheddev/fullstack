import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Alert, Snackbar } from "@mui/material";
import { useMeasurements } from "../entities/measurement/model/useMeasurements";
import Layout from "./Layout";
import HomePage from "../pages/HomePage";
import HistoryPage from "../pages/HistoryPage";
import NewMeasurementPage from "../pages/NewMeasurementPage";
import EditMeasurementPage from "../pages/EditMeasurementPage";
import NotFoundPage from "../pages/NotFoundPage";
import DataState from "../shared/ui/DataState";

export default function App() {
  const journal = useMeasurements();
  const [notification, setNotification] = useState("");
  const { pathname } = useLocation();

  return (
    <Layout>
      <DataState status={journal.status} error={journal.error} onRetry={journal.retry}>
        <div key={pathname} className="page-content">
          <Routes>
            <Route path="/" element={<HomePage measurements={journal.measurements} />} />
            <Route path="/measurements" element={<HistoryPage measurements={journal.measurements} onDelete={(id) => {
              journal.remove(id);
              setNotification("Измерение удалено.");
            }} />} />
            <Route path="/measurements/new" element={<NewMeasurementPage onAdd={(data) => {
              journal.add(data);
              setNotification("Измерение сохранено и добавлено в историю.");
            }} />} />
            <Route path="/measurements/:id/edit" element={<EditMeasurementPage measurements={journal.measurements} onUpdate={(id, data) => {
              journal.update(id, data);
              setNotification("Изменения сохранены.");
            }} />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </DataState>
      <Snackbar key={notification} open={Boolean(notification)} autoHideDuration={6000}
        onClose={(_, reason) => { if (reason !== "clickaway") setNotification(""); }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setNotification("")}>
          {notification}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
