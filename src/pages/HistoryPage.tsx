import { useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import SouthRounded from "@mui/icons-material/SouthRounded";
import { Link } from "react-router-dom";
import { isMeasurementType, measurementTypes } from "../types/measurement";
import type { Measurement, MeasurementType } from "../types/measurement";
import { measurementInfo } from "../data/measurements";
import { sortMeasurements } from "../utils/format";
import MeasurementList from "../components/MeasurementList";

export default function HistoryPage({
  measurements,
}: {
  measurements: Measurement[];
}) {
  const [filter, setFilter] = useState<MeasurementType | "all">("all");
  const filteredMeasurements = sortMeasurements(measurements).filter(
    (measurement) => filter === "all" || measurement.type === filter,
  );

  return (
    <>
      <div className="page-heading with-action">
        <div>
          <div className="eyebrow">ЛИЧНЫЙ ЖУРНАЛ</div>
          <Typography variant="h1">История измерений</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Все ваши записи в хронологическом порядке.
          </Typography>
        </div>
        <Button
          component={Link}
          to="/measurements/new"
          startIcon={<AddRounded />}
          variant="contained"
        >
          Добавить измерение
        </Button>
      </div>
      <Paper className="records-panel history-panel">
        <div className="history-toolbar">
          <FormControl size="small" className="filter-control">
            <InputLabel id="filter-label">Тип показателя</InputLabel>
            <Select
              labelId="filter-label"
              label="Тип показателя"
              value={filter}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "all" || isMeasurementType(value))
                  setFilter(value);
              }}
            >
              <MenuItem value="all">Все показатели</MenuItem>
              {measurementTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {measurementInfo[type].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="history-meta">
            <span>Записей: {filteredMeasurements.length}</span>
            <span className="sort-label">
              <SouthRounded sx={{ fontSize: 15 }} />
              Сначала новые
            </span>
          </div>
        </div>
        <MeasurementList
          measurements={filteredMeasurements}
          filtered={filter !== "all"}
        />
      </Paper>
      <Typography
        className="journal-caption"
        variant="body2"
        color="text.secondary"
      >
        Время отображается в часовом поясе вашего устройства.
      </Typography>
    </>
  );
}
