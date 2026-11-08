import type { ReactNode } from "react";
import { Alert, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface Props {
  status: "loading" | "ready" | "error";
  error: string;
  onRetry: () => void;
  children: ReactNode;
}

export default function DataState({ status, error, onRetry, children }: Props) {
  if (status === "loading") return (
    <Paper className="data-state" role="status" aria-live="polite" aria-busy="true">
      <CircularProgress aria-label="Загрузка журнала" size={32} />
      <Typography variant="h1">Загружаем измерения…</Typography>
      <Typography color="text.secondary">Скоро здесь появятся ваши записи.</Typography>
    </Paper>
  );
  if (status === "error") return (
    <Paper className="data-state">
      <Typography variant="h1">Журнал пока недоступен</Typography>
      <Alert severity="error">{error}</Alert>
      <Button variant="contained" onClick={onRetry}>Повторить загрузку</Button>
    </Paper>
  );
  return children;
}
