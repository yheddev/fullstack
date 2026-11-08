import { useState } from "react";
import type { FormEvent } from "react";
import {
  Button,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import EditNoteRounded from "@mui/icons-material/EditNoteRounded";
import { Link, useNavigate } from "react-router-dom";
import { isMeasurementType, measurementTypes } from "../types/measurement";
import type { MeasurementType, NewMeasurement } from "../types/measurement";
import { measurementInfo } from "../data/measurements";
import { parseLocalDateTime, toLocalDateTime } from "../utils/format";

interface FormErrors {
  value?: string;
  systolic?: string;
  diastolic?: string;
  measuredAt?: string;
}

function validateNumber(value: string, integer: boolean): string | undefined {
  if (!value.trim()) return "Введите значение.";
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized) || !Number.isFinite(Number(normalized)))
    return "Введите корректное положительное число.";
  if (Number(normalized) <= 0) return "Значение должно быть больше нуля.";
  if (integer && !Number.isSafeInteger(Number(normalized)))
    return "Введите целое положительное число.";
  return undefined;
}

export default function NewMeasurementPage({
  onAdd,
}: {
  onAdd: (measurement: NewMeasurement) => void;
}) {
  const navigate = useNavigate();
  const [type, setType] = useState<MeasurementType>("pulse");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [measuredAt, setMeasuredAt] = useState(() =>
    toLocalDateTime(new Date()),
  );
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const info = measurementInfo[type];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (type === "pressure") {
      nextErrors.systolic = validateNumber(systolic, true);
      nextErrors.diastolic = validateNumber(diastolic, true);
    } else {
      nextErrors.value = validateNumber(value, type === "pulse");
    }
    const date = parseLocalDateTime(measuredAt);
    if (!date) nextErrors.measuredAt = "Укажите корректные дату и время.";
    setErrors(nextErrors);

    const invalidField = Object.keys(nextErrors).find(
      (key) => nextErrors[key as keyof FormErrors],
    );
    if (invalidField) {
      const input = event.currentTarget.elements.namedItem(invalidField);
      if (input instanceof HTMLElement) input.focus();
      return;
    }
    if (!date) return;

    const common = { measuredAt: date.toISOString(), note: note.trim() };
    if (type === "pressure") {
      onAdd({
        ...common,
        type,
        systolic: Number(systolic.trim().replace(",", ".")),
        diastolic: Number(diastolic.trim().replace(",", ".")),
      });
    } else {
      onAdd({ ...common, type, value: Number(value.trim().replace(",", ".")) });
    }
    navigate("/measurements");
  }

  return (
    <>
      <Button
        component={Link}
        to="/measurements"
        startIcon={<ArrowBackRounded />}
        className="back-link"
      >
        К истории измерений
      </Button>
      <div className="page-heading">
        <div className="eyebrow">НОВАЯ ЗАПИСЬ</div>
        <Typography variant="h1">Добавить измерение</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Запишите показатель, который измерили самостоятельно.
        </Typography>
      </div>
      <div className="form-layout">
        <Paper
          component="form"
          noValidate
          onSubmit={handleSubmit}
          className="measurement-form"
        >
          <div className="form-section-heading">
            <span className="step-number">1</span>
            <Typography variant="h2">Данные измерения</Typography>
          </div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Поля со звёздочкой обязательны для заполнения.
          </Typography>
          <FormControl fullWidth required sx={{ mb: 3 }}>
            <InputLabel id="type-label">Тип показателя</InputLabel>
            <Select
              labelId="type-label"
              label="Тип показателя"
              value={type}
              onChange={(event) => {
                if (isMeasurementType(event.target.value)) {
                  setType(event.target.value);
                  setValue("");
                  setSystolic("");
                  setDiastolic("");
                  setErrors({});
                }
              }}
            >
              {measurementTypes.map((item) => (
                <MenuItem key={item} value={item}>
                  {measurementInfo[item].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {type === "pressure" ? (
            <div className="pressure-fields">
              <TextField
                label="Верхнее давление"
                name="systolic"
                required
                fullWidth
                value={systolic}
                onChange={(event) => setSystolic(event.target.value)}
                error={Boolean(errors.systolic)}
                helperText={errors.systolic || "Систолическое"}
                slotProps={{
                  htmlInput: { inputMode: "numeric" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {info.unit}
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Нижнее давление"
                name="diastolic"
                required
                fullWidth
                value={diastolic}
                onChange={(event) => setDiastolic(event.target.value)}
                error={Boolean(errors.diastolic)}
                helperText={errors.diastolic || "Диастолическое"}
                slotProps={{
                  htmlInput: { inputMode: "numeric" },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {info.unit}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
          ) : (
            <TextField
              label="Значение"
              name="value"
              required
              fullWidth
              value={value}
              onChange={(event) => setValue(event.target.value)}
              error={Boolean(errors.value)}
              helperText={
                errors.value ||
                (type === "pulse"
                  ? "Целое положительное число"
                  : "Дробную часть можно отделить точкой или запятой")
              }
              slotProps={{
                htmlInput: {
                  inputMode: type === "pulse" ? "numeric" : "decimal",
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">{info.unit}</InputAdornment>
                  ),
                },
              }}
            />
          )}
          <TextField
            label="Дата и время измерения"
            name="measuredAt"
            type="datetime-local"
            required
            fullWidth
            value={measuredAt}
            onChange={(event) => setMeasuredAt(event.target.value)}
            error={Boolean(errors.measuredAt)}
            helperText={errors.measuredAt || "Местное время вашего устройства"}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: "0001-01-01T00:00", max: "9999-12-31T23:59" },
            }}
            sx={{ mt: 3 }}
          />
          <Divider sx={{ my: 3 }} />
          <div className="form-section-heading">
            <span className="step-number">2</span>
            <Typography variant="h2">Заметка</Typography>
            <span className="optional-label">необязательно</span>
          </div>
          <TextField
            label="Заметка к измерению"
            placeholder="Например, утром после отдыха"
            multiline
            minRows={3}
            fullWidth
            value={note}
            onChange={(event) => setNote(event.target.value)}
            helperText={`${note.length}/500 символов`}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            sx={{ mt: 1 }}
          />
          <div className="form-actions">
            <Button
              type="submit"
              variant="contained"
              startIcon={<CheckRounded />}
            >
              Сохранить
            </Button>
            <Button component={Link} to="/measurements" variant="outlined">
              Отмена
            </Button>
          </div>
        </Paper>
        <aside className="form-aside">
          <span className="form-aside-icon">
            <EditNoteRounded />
          </span>
          <Typography variant="h3">Детали имеют значение</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1.5 }}>
            В заметке можно указать время суток или обстоятельства измерения.
            Так будет проще вспомнить контекст записи.
          </Typography>
          <Divider sx={{ my: 2.5 }} />
          <Typography color="text.secondary" variant="body2">
            После сохранения запись появится в истории. На главной отображается
            последнее измерение по дате для каждого показателя.
          </Typography>
        </aside>
      </div>
    </>
  );
}
