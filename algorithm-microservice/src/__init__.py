"""
timetable_api.app package

This package contains the FastAPI application, routes, services, and supporting
modules for the Timetable Generator API.

To get the FastAPI app instance without importing submodules at package import
time, use the `get_app()` function or access `app` via the lazy attribute below.
"""

from __future__ import annotations

from importlib import import_module
from typing import TYPE_CHECKING

__all__ = ["get_app", "__version__"]

__version__ = "0.1.0"

if TYPE_CHECKING:
    # Only for type checkers; avoids importing FastAPI at runtime here.
    from fastapi import FastAPI


def get_app() -> "FastAPI":
    """
    Lazily import and return the FastAPI app instance defined in `.main`.

    Returns:
        FastAPI: The FastAPI application instance.

    Raises:
        RuntimeError: If the `.main` module cannot be imported or doesn't expose `app`.
    """
    try:
        module = import_module(f"{__name__}.main")
    except Exception as exc:
        raise RuntimeError(
            "Failed to import the FastAPI application from timetable_api.app.main. "
            "Ensure `timetable_api/app/main.py` exists and defines `app = FastAPI(...)`."
        ) from exc

    app = getattr(module, "app", None)
    if app is None:
        raise RuntimeError(
            "The module `timetable_api.app.main` does not define a top-level `app` variable."
        )
    return app


def __getattr__(name: str):
    """
    Provide a lazy attribute for `app` so consumers can `from timetable_api.app import app`
    without eagerly importing submodules at package import time.
    """
    if name == "app":
        return get_app()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
