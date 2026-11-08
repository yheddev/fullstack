import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery } from "@mui/material";
import type { Measurement } from "../../entities/measurement/model/types";
import { measurementInfo } from "../../entities/measurement/model/info";
import { formatDate } from "../../shared/lib/date";
import { formatValue } from "../../entities/measurement/lib/format";

interface Props {
  measurement: Measurement | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

export default function DeleteMeasurementDialog({ measurement, onCancel, onConfirm }: Props) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Dialog open={measurement !== null} onClose={onCancel} aria-labelledby="delete-title"
      aria-describedby="delete-description" transitionDuration={reduceMotion ? 0 : 160}>
      <DialogTitle id="delete-title">Удалить измерение?</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-description">
          {measurement && `${measurementInfo[measurement.type].label}: ${formatValue(measurement)} ${measurementInfo[measurement.type].unit}, ${formatDate(measurement.measuredAt)}. `}
          Запись исчезнет из истории и с главной страницы.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onCancel}>Отмена</Button>
        <Button color="error" variant="contained" onClick={() => measurement && onConfirm(measurement.id)}>
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  );
}
