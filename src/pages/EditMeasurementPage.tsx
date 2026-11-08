import { Alert, Button, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { Link, useNavigate, useParams } from "react-router-dom";
import MeasurementForm from "../features/measurement-form/MeasurementForm";
import type { Measurement, NewMeasurement } from "../entities/measurement/model/types";

interface Props {
  measurements: Measurement[];
  onUpdate: (id: string, data: NewMeasurement) => void;
}

export default function EditMeasurementPage({ measurements, onUpdate }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const measurement = measurements.find((item) => item.id === id);
  return (
    <>
      <Button component={Link} to="/measurements" startIcon={<ArrowBackRounded />} className="back-link">
        К истории измерений
      </Button>
      <div className="page-heading">
        <div className="eyebrow">ИЗМЕНЕНИЕ ЗАПИСИ</div>
        <Typography variant="h1">Редактировать измерение</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Исправьте данные и сохраните изменения.</Typography>
      </div>
      {measurement ? (
        <MeasurementForm key={measurement.id} initialMeasurement={measurement} onSave={(data) => {
          onUpdate(measurement.id, data);
          navigate("/measurements");
        }} />
      ) : <Alert severity="warning">Измерение не найдено. Возможно, оно удалено или исчезло после обновления страницы.</Alert>}
    </>
  );
}
