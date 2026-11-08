import { Button, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { Link, useNavigate } from "react-router-dom";
import MeasurementForm from "../features/measurement-form/MeasurementForm";
import type { NewMeasurement } from "../entities/measurement/model/types";

export default function NewMeasurementPage({ onAdd }: { onAdd: (data: NewMeasurement) => void }) {
  const navigate = useNavigate();
  return (
    <>
      <Button component={Link} to="/measurements" startIcon={<ArrowBackRounded />} className="back-link">
        К истории измерений
      </Button>
      <div className="page-heading">
        <div className="eyebrow">НОВАЯ ЗАПИСЬ</div>
        <Typography variant="h1">Добавить измерение</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Запишите показатель, который измерили самостоятельно.
        </Typography>
      </div>
      <MeasurementForm onSave={(data) => { onAdd(data); navigate("/measurements"); }} />
    </>
  );
}
