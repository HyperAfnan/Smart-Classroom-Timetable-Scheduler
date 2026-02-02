"""
Top-level package initializer for the timetable_api.

This package provides a FastAPI application for generating classroom timetables.
To retrieve the FastAPI app instance, use `get_app()` or access the lazy `app`
attribute directly:

    from timetable_api import get_app, app

Both forms are supported. `app` is provided lazily to avoid importing FastAPI
and submodules at package import time.
"""

from __future__ import annotations

from importlib import import_module
from typing import TYPE_CHECKING

__all__ = ["get_app", "__version__"]
__version__ = "0.1.0"

if TYPE_CHECKING:
    # Only for type-checkers to know the return type of get_app()
    from fastapi import FastAPI


def get_app() -> "FastAPI":
    """
    Lazily import and return the FastAPI application instance.

    Returns:
        FastAPI: The application instance defined in timetable_api.app.main.

    Raises:
        RuntimeError: If the app cannot be imported or is not defined.
    """
    try:
        # Reuse the helper already provided in timetable_api.app
        module = import_module("timetable_api.src.main")
        app = getattr(module, "src", None)
        if app is None:
            # Fallback to helper if app attribute isn't bound yet
            get_app_fn = getattr(module, "get_app", None)
            if get_app_fn is None:
                raise RuntimeError(
                    "Could not locate `app` or `get_app()` in timetable_api.app"
                )
            app = get_app_fn()
        return app
    except Exception as exc:
        raise RuntimeError(
            "Failed to import FastAPI app from timetable_api.app. "
            "Ensure `timetable_api/app/main.py` defines `app = FastAPI(...)` "
            "or that `timetable_api.app.get_app()` is available."
        ) from exc


def __getattr__(name: str):
    """
    Provide a lazy `app` attribute for convenient imports.

    Example:
        from timetable_api import app
    """
    if name == "src":
        return get_app()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
