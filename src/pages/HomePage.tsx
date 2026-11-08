import { Button, Paper, Typography } from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import { Link } from "react-router-dom";
import type { Measurement } from "../types/measurement";
import { measurementTypes } from "../types/measurement";
import { measurementInfo } from "../data/measurements";
import { formatDate, formatValue, sortMeasurements } from "../utils/format";
import MeasurementIcon from "../components/MeasurementIcon";
import MeasurementList from "../components/MeasurementList";

export default function HomePage({
  measurements,
}: {
  measurements: Measurement[];
}) {
  const sortedMeasurements = sortMeasurements(measurements);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">ВАШЕ ЗДОРОВЬЕ В ДЕТАЛЯХ</div>
          <Typography variant="h1">Обзор показателей</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Всё, что вы записали о своём самочувствии, — под рукой.
          </Typography>
        </div>
      </div>
      <section className="welcome-banner" aria-label="О журнале">
        <div className="welcome-content">
          <span className="banner-tag">
            <span />
            Просто. Спокойно. Каждый день.
          </span>
          <Typography component="h2" className="welcome-title">
            Больше внимания себе
          </Typography>
          <Typography className="welcome-description">
            Записывайте показатели здоровья дома
            <br className="desktop-break" /> и возвращайтесь к ним в удобное
            время.
          </Typography>
          <Button
            component={Link}
            to="/measurements/new"
            variant="contained"
            startIcon={<AddRounded />}
          >
            Добавить измерение
          </Button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="art-circle circle-one" />
          <div className="art-circle circle-two" />
          <svg viewBox="0 0 260 180" className="heart-art">
            <path
              d="M130 153C112 140 54 104 54 65c0-40 53-53 76-17 23-36 76-23 76 17 0 39-58 75-76 88Z"
              fill="#e6dcf7"
              stroke="#b49bdc"
              strokeWidth="2"
            />
            <path
              d="M32 93h64l16-30 23 64 21-42 14 8h58"
              fill="none"
              stroke="#8058ba"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="art-plus plus-one">+</span>
          <span className="art-plus plus-two">+</span>
          <span className="art-dot" />
        </div>
      </section>
      <section aria-labelledby="latest-heading" className="latest-section">
        <div className="section-heading">
          <Typography id="latest-heading" variant="h2">
            Последние измерения
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Последняя запись каждого типа
          </Typography>
        </div>
        <div className="measurement-grid">
          {measurementTypes.map((type) => {
            const latest = sortedMeasurements.find(
              (measurement) => measurement.type === type,
            );
            const info = measurementInfo[type];
            return (
              <Paper
                key={type}
                component="article"
                className="metric-card"
                aria-label={`Последнее измерение: ${info.label}`}
              >
                <MeasurementIcon type={type} />
                <Typography component="h3" className="metric-label">
                  {info.label}
                </Typography>
                <div className="metric-value">
                  {latest ? formatValue(latest) : "—"}
                </div>
                <div className="metric-unit">{info.unit}</div>
                <div className="metric-date">
                  <AccessTimeRounded sx={{ fontSize: 13 }} />
                  {latest ? formatDate(latest.measuredAt) : "Пока нет записей"}
                </div>
              </Paper>
            );
          })}
        </div>
      </section>
      <section className="recent-section" aria-labelledby="recent-heading">
        <div className="section-heading">
          <div className="section-title">
            <Typography id="recent-heading" variant="h2">
              Последние записи
            </Typography>
            <span className="count-badge">{measurements.length}</span>
          </div>
          <Button
            component={Link}
            to="/measurements"
            endIcon={<ArrowForwardRounded />}
            size="small"
          >
            Вся история
          </Button>
        </div>
        <Paper className="records-panel">
          <MeasurementList measurements={sortedMeasurements.slice(0, 5)} />
        </Paper>
        <Typography
          className="journal-caption"
          variant="body2"
          color="text.secondary"
        >
          Журнал сохраняет ваши записи и не оценивает состояние здоровья.
        </Typography>
      </section>
    </>
  );
}
