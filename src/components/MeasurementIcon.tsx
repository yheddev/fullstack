import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import MonitorHeartOutlined from "@mui/icons-material/MonitorHeartOutlined";
import ThermostatRounded from "@mui/icons-material/ThermostatRounded";
import WaterDropOutlined from "@mui/icons-material/WaterDropOutlined";
import MonitorWeightOutlined from "@mui/icons-material/MonitorWeightOutlined";
import type { MeasurementType } from "../types/measurement";
import { measurementInfo } from "../data/measurements";

export default function MeasurementIcon({
  type,
  small = false,
}: {
  type: MeasurementType;
  small?: boolean;
}) {
  const info = measurementInfo[type];
  const icons = {
    pulse: FavoriteBorderRounded,
    pressure: MonitorHeartOutlined,
    temperature: ThermostatRounded,
    sugar: WaterDropOutlined,
    weight: MonitorWeightOutlined,
  };
  const Icon = icons[type];

  return (
    <span
      className={`measurement-icon${small ? " small" : ""}`}
      style={{ color: info.color, background: info.background }}
    >
      <Icon fontSize="small" />
    </span>
  );
}
