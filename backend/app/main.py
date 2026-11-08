from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.routers import measurements, profiles

app = FastAPI(title="Рядом — API журнала здоровья", version="2.0.0")
app.include_router(profiles.router)
app.include_router(measurements.router)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, error: RequestValidationError):
    # Не возвращаем исходный ввод: он может содержать личные заметки или NaN.
    errors = [
        {"field": ".".join(str(part) for part in item["loc"]), "message": item["msg"]}
        for item in error.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": "Проверьте поля запроса", "errors": errors},
    )
