from __future__ import annotations

"""
FastAPI application entrypoint for the Timetable API.

This module wires together:
- App settings (title, version) from core.config.Settings
- CORS middleware based on settings
- API routers for timetable generation and example endpoints
"""

from fastapi import FastAPI

from .core.config import apply_cors, get_settings
from .routes.timetable_routes import router as timetable_router
from .routes.example_routes import router as example_router


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application instance.
    """
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
    )

    # Middleware
    apply_cors(app, settings)

    # Routers (keep same paths/behavior as the original monolith)
    app.include_router(timetable_router)
    app.include_router(example_router)

    return app


# Expose the ASGI app
app = create_app()


if __name__ == "__main__":
    # Local development entrypoint
    import uvicorn

    uvicorn.run("timetable_api.app.main:app", host="0.0.0.0", port=8000, reload=False)
