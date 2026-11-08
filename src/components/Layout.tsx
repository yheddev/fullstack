import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Chip, Typography } from "@mui/material";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import GridViewRounded from "@mui/icons-material/GridViewRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import SpaOutlined from "@mui/icons-material/SpaOutlined";

const navigation = [
  { path: "/", label: "Главная", icon: GridViewRounded, end: true },
  { path: "/measurements", label: "История", icon: HistoryRounded, end: true },
  {
    path: "/measurements/new",
    label: "Добавить измерение",
    icon: AddCircleOutlineRounded,
    end: true,
  },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const title =
      navigation.find((item) => item.path === pathname)?.label ??
      "Страница не найдена";
    document.title = `${title} — Рядом`;
    window.scrollTo(0, 0);
    if (previousPath.current !== pathname) {
      document.getElementById("main-content")?.focus();
      previousPath.current = pathname;
    }
  }, [pathname]);

  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        К содержимому
      </a>
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Рядом — на главную">
          <span className="brand-symbol">
            <FavoriteBorderRounded />
          </span>
          <span>
            <strong>
              рядом<span className="brand-dot">.</span>
            </strong>
            <small>журнал здоровья</small>
          </span>
        </NavLink>
        <div className="sidebar-section-label">ЛИЧНЫЙ ЖУРНАЛ</div>
        <nav className="navigation" aria-label="Основная навигация">
          {navigation.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <SpaOutlined sx={{ color: "primary.main", mb: 1 }} />
          <Typography variant="body2" fontWeight={600}>
            Маленькие записи.
            <br />
            Больше внимания к себе.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ваши показатели в одном месте.
          </Typography>
        </div>
        <div className="sidebar-footer">
          Домашний мониторинг<span>Учебный проект · № 1</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="topbar-label">Домашний мониторинг</span>
          <div className="topbar-right">
            <span className="today">
              <CalendarTodayOutlined sx={{ fontSize: 16 }} />
              {new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
            <Chip label="Демо-профиль" size="small" className="demo-chip" />
            <span className="profile-avatar" aria-hidden="true">
              Д
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">
          {children}
        </main>
        <footer className="page-footer">
          <span>Рядом — ваш личный журнал измерений</span>
          <span>Демонстрационные данные</span>
        </footer>
      </div>
    </div>
  );
}
