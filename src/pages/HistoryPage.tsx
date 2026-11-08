import { useState } from "react";
import { Button, Paper, Typography } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import { Link } from "react-router-dom";
import type { Measurement, MeasurementType } from "../entities/measurement/model/types";
import { sortMeasurements } from "../entities/measurement/lib/format";
import MeasurementList from "../entities/measurement/ui/MeasurementList";
import MeasurementFilters from "../features/filter-measurements/MeasurementFilters";
import DeleteMeasurementDialog from "../features/delete-measurement/DeleteMeasurementDialog";

interface Props {
  measurements: Measurement[];
  onDelete: (id: string) => void;
}

export default function HistoryPage({ measurements, onDelete }: Props) {
  const [type, setType] = useState<MeasurementType | "all">("all");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [toDelete, setToDelete] = useState<Measurement | null>(null);
  const search = query.trim().toLocaleLowerCase("ru-RU");
  const visible = sortMeasurements(measurements).filter((measurement) =>
    (type === "all" || measurement.type === type) &&
    measurement.note.toLocaleLowerCase("ru-RU").includes(search),
  );
  if (order === "oldest") visible.reverse();

  return (
    <>
      <div className="page-heading with-action">
        <div>
          <div className="eyebrow">ЛИЧНЫЙ ЖУРНАЛ</div>
          <Typography variant="h1">История измерений</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Найдите, исправьте или удалите нужную запись.</Typography>
        </div>
        <Button component={Link} to="/measurements/new" startIcon={<AddRounded />} variant="contained">Добавить измерение</Button>
      </div>
      <Paper className="records-panel history-panel">
        <MeasurementFilters type={type} query={query} order={order}
          onTypeChange={setType} onQueryChange={setQuery} onOrderChange={setOrder}
          onReset={() => { setType("all"); setQuery(""); setOrder("newest"); }} />
        <Typography className="results-count" variant="body2" color="text.secondary" role="status">
          Показано: {visible.length} из {measurements.length}
        </Typography>
        <MeasurementList measurements={visible} filtered={type !== "all" || Boolean(search)}
          renderActions={(measurement) => (
            <div className="record-actions">
              <Button size="small" component={Link} to={`/measurements/${measurement.id}/edit`}>Изменить</Button>
              <Button size="small" color="error" onClick={() => setToDelete(measurement)}>Удалить</Button>
            </div>
          )} />
      </Paper>
      <Typography className="journal-caption" variant="body2" color="text.secondary">
        Изменения хранятся до обновления страницы. Время — в часовом поясе вашего устройства.
      </Typography>
      <DeleteMeasurementDialog measurement={toDelete} onCancel={() => setToDelete(null)}
        onConfirm={(id) => { onDelete(id); setToDelete(null); }} />
    </>
  );
}
