import { Button, MenuItem, TextField } from "@mui/material";
import { isMeasurementType, measurementTypes } from "../../entities/measurement/model/types";
import type { MeasurementType } from "../../entities/measurement/model/types";
import { measurementInfo } from "../../entities/measurement/model/info";

interface Props {
  type: MeasurementType | "all";
  query: string;
  order: "newest" | "oldest";
  onTypeChange: (type: MeasurementType | "all") => void;
  onQueryChange: (query: string) => void;
  onOrderChange: (order: "newest" | "oldest") => void;
  onReset: () => void;
}

export default function MeasurementFilters(props: Props) {
  return (
    <div className="measurement-filters">
      <TextField select label="Тип показателя" size="small" value={props.type} onChange={(event) => {
        const value = event.target.value;
        if (value === "all" || isMeasurementType(value)) props.onTypeChange(value);
      }}>
        <MenuItem value="all">Все показатели</MenuItem>
        {measurementTypes.map((type) => <MenuItem key={type} value={type}>{measurementInfo[type].label}</MenuItem>)}
      </TextField>
      <TextField label="Поиск по заметке" size="small" value={props.query}
        onChange={(event) => props.onQueryChange(event.target.value)} />
      <TextField select label="Порядок записей" size="small" value={props.order} onChange={(event) => {
        if (event.target.value === "newest" || event.target.value === "oldest") props.onOrderChange(event.target.value);
      }}>
        <MenuItem value="newest">Сначала новые</MenuItem>
        <MenuItem value="oldest">Сначала старые</MenuItem>
      </TextField>
      <Button onClick={props.onReset} disabled={props.type === "all" && !props.query && props.order === "newest"}>
        Сбросить
      </Button>
    </div>
  );
}
