# Рядом — журнал здоровья

Учебное приложение для записи пульса, давления, температуры, сахара крови и веса. Можно добавлять измерения с датой и заметкой, смотреть последние показатели и фильтровать историю. Приложение не ставит диагнозы и не даёт медицинских рекомендаций.

**Текущее состояние:** frontend первой лабораторной работает с демоданными в памяти — после обновления страницы добавленные записи исчезают. Backend второй лабораторной хранит данные в PostgreSQL и доступен через API. Frontend пока не подключён к backend.

## Технологии и структура

- `src/` — React, TypeScript, Vite, React Router и Material UI.
- `backend/` — Python, FastAPI, SQLAlchemy и PostgreSQL.
- `docs/guides/` — подробные руководства по лабораторным.
- `docs/screenshots/` — скриншоты интерфейса.

В БД две связанные таблицы: `profiles` (`id`, `name`, `created_at`) и `measurements` (`id`, `profile_id`, `type`, `measured_at`, `value`, `systolic`, `diastolic`, `note`). У одного профиля несколько измерений; `profile_id` — внешний ключ на профиль. Давление хранится двумя числами, остальные показатели — одним.

## Запуск frontend

Нужны **Node.js 22.12 или новее** и npm. Из корня проекта:

```bash
npm ci
npm run dev
```

Откройте адрес из терминала, обычно **http://localhost:5173**. Для запуска только интерфейса Python и PostgreSQL не нужны.

| Экран | Адрес | Как пользоваться |
| --- | --- | --- |
| Главная | `/` | Последние показатели и пять последних записей |
| История | `/measurements` | Все записи и фильтр по типу показателя |
| Добавление | `/measurements/new` | Выберите тип, введите значение, дату и заметку, нажмите «Сохранить» |

Для давления вводятся верхнее и нижнее значения. Числа должны быть положительными; пульс и давление — целыми. Дроби в форме можно вводить с точкой или запятой. После сохранения открывается история.

## Запуск backend

Нужны **Python 3.10 или новее** и PostgreSQL. Ниже — запуск БД через **Docker с Compose**; Docker должен быть запущен. Вариант с установленной PostgreSQL описан в [руководстве по лабораторной № 2](docs/guides/lab2.md).

**1. Из корня проекта создайте файл настроек.**

```bash
# macOS / Linux
cp backend/.env.example backend/.env
```

```powershell
# Windows PowerShell
Copy-Item backend/.env.example backend/.env
```

В `backend/.env` замените `change_me_local` своим локальным паролем в двух местах: `POSTGRES_PASSWORD` и `DATABASE_URL`. Для простого запуска используйте латинские буквы и цифры; специальные символы в пароле URL требуют кодирования. Файл `.env` исключён из Git.

**2. Из корня проекта запустите БД:**

```bash
docker compose up -d --wait db
```

**3. Установите зависимости, создайте таблицы и запустите API.**

Windows PowerShell:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m app.init_db
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

macOS / Linux:

```bash
cd backend
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m app.init_db
.venv/bin/python -m uvicorn app.main:app --reload
```

Откройте **http://127.0.0.1:8000/docs** — Swagger UI для работы с API. Для загрузки интерфейса Swagger нужен интернет. Авторизации в этой версии нет; API предназначен для локальной учебной работы.

При следующем запуске достаточно поднять БД и повторить команду `uvicorn` из папки `backend`. Остановка frontend и API — `Ctrl+C` в их терминалах. Остановка БД из корня проекта — `docker compose stop db`; данные сохраняются в Docker-томе. Не добавляйте `-v` к `docker compose down`, если нужно сохранить данные.

## Работа с API

В Swagger раскройте запрос, нажмите **Try it out**, заполните поля и нажмите **Execute**.

1. Создайте профиль через `POST /api/profiles` с телом `{"name": "Учебный профиль"}`. Запомните `id` из ответа.
2. Создайте измерение через `POST /api/measurements`, подставив полученный ID в `profile_id`:

   ```json
   {
     "profile_id": 1,
     "type": "pulse",
     "value": 72,
     "measured_at": "2026-11-08T09:00:00+03:00",
     "note": "После отдыха"
   }
   ```

3. Просмотрите записи через `GET /api/measurements`. Можно указать фильтры `profile_id` и `type`; для страниц списка — `limit` (1–100) и `offset`.
4. Измените запись через `PUT /api/measurements/{measurement_id}`, отправив полное тело, или удалите через `DELETE` по тому же адресу. Для профилей доступны такие же операции по `/api/profiles` и `/api/profiles/{profile_id}`.

Типы: `pulse`, `pressure`, `temperature`, `sugar`, `weight`. Для давления вместо `value` передаются целые `systolic` и `diastolic`. В JSON числа пишутся без кавычек, дроби — с точкой; дата должна содержать часовой пояс. Заметка необязательна, до 500 символов.

Успешное создание возвращает `201`, чтение и изменение — `200`, удаление — `204`. Ошибки: `404` — запись не найдена, `422` — неверные поля, `409` — конфликт связей или ограничений БД. Перед удалением профиля нужно удалить его измерения. Записи API сохраняются после перезапуска, но в интерфейсе React пока не отображаются.

## Проверки и подробные руководства

Проверки frontend из корня проекта:

```bash
npm run typecheck
npm run lint
npm run build
```

Сборка создаётся в `dist/`; посмотреть её локально можно командой `npm run preview`.

- [Лабораторная № 1](docs/guides/lab1.md) — устройство frontend, объяснение кода, подготовка к защите, скриншоты и проверки.
- [Лабораторная № 2](docs/guides/lab2.md) — устройство backend, модель БД, примеры CRUD, запуск тестов на отдельной БД и частые проблемы.
