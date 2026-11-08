import { Button, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="error-code">404</div>
      <Typography variant="h1">Страница не найдена</Typography>
      <Typography color="text.secondary" sx={{ my: 2 }}>
        Возможно, в адресе опечатка. Вернитесь к вашему журналу.
      </Typography>
      <Button
        component={Link}
        to="/"
        startIcon={<ArrowBackRounded />}
        variant="contained"
      >
        На главную
      </Button>
    </div>
  );
}
