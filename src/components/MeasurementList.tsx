import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import { Link } from "react-router-dom";
import type { Measurement } from "../types/measurement";
import { measurementInfo } from "../data/measurements";
import { formatDate, formatValue } from "../utils/format";
import MeasurementIcon from "./MeasurementIcon";

export default function MeasurementList({
  measurements,
  filtered = false,
}: {
  measurements: Measurement[];
  filtered?: boolean;
}) {
  if (measurements.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-icon">
          <HistoryRounded />
        </span>
        <Typography variant="h3">
          {filtered ? "Измерений этого типа пока нет" : "Пока нет измерений"}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {filtered
            ? "Выберите другой показатель или добавьте новую запись."
            : "Добавьте первую запись — она появится здесь и на главной."}
        </Typography>
        <Button
          component={Link}
          to="/measurements/new"
          startIcon={<AddRounded />}
          variant="outlined"
        >
          Добавить измерение
        </Button>
      </div>
    );
  }

  return (
    <>
      <TableContainer className="desktop-measurements">
        <Table aria-label="Измерения здоровья">
          <TableHead>
            <TableRow>
              <TableCell>Показатель</TableCell>
              <TableCell>Значение</TableCell>
              <TableCell>Дата и время</TableCell>
              <TableCell>Заметка</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements.map((measurement) => (
              <TableRow key={measurement.id} hover>
                <TableCell>
                  <span className="table-type">
                    <MeasurementIcon type={measurement.type} small />
                    {measurementInfo[measurement.type].label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="table-value">
                    {formatValue(measurement)}
                  </span>
                  <span className="table-unit">
                    {measurementInfo[measurement.type].unit}
                  </span>
                </TableCell>
                <TableCell className="date-cell">
                  {formatDate(measurement.measuredAt)}
                </TableCell>
                <TableCell className="note-cell">
                  {measurement.note || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="mobile-measurements">
        {measurements.map((measurement) => (
          <Paper key={measurement.id} className="mobile-record">
            <div className="mobile-record-heading">
              <span className="table-type">
                <MeasurementIcon type={measurement.type} small />
                {measurementInfo[measurement.type].label}
              </span>
              <span className="mobile-value">
                {formatValue(measurement)}
                <small>{measurementInfo[measurement.type].unit}</small>
              </span>
            </div>
            <Typography
              component="time"
              dateTime={measurement.measuredAt}
              variant="body2"
              color="text.secondary"
            >
              {formatDate(measurement.measuredAt)}
            </Typography>
            {measurement.note && (
              <Typography variant="body2" className="mobile-note">
                {measurement.note}
              </Typography>
            )}
          </Paper>
        ))}
      </div>
    </>
  );
}
