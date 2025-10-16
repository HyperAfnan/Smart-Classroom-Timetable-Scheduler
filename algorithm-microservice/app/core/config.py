"""
Core configuration and CORS utilities for the Timetable API.

This module provides:
- A Settings object populated from environment variables (with sensible defaults).
- Helper functions to retrieve settings and apply CORS middleware to a FastAPI app.

Environment variables:
- APP_NAME: The display name for the application (default: "Timetable Generator API")
- APP_VERSION: The application version (default: "1.0.0")
- DEBUG: Enable debug mode ("true"/"1"/"yes") (default: "false")
- CORS_ALLOW_ORIGINS: Comma-separated list or JSON array of origins (default: local dev URLs)
- CORS_ALLOW_CREDENTIALS: Allow credentials for CORS ("true"/"1"/"yes") (default: "true")
- CORS_ALLOW_METHODS: Comma-separated list or JSON array of HTTP methods (default: ["*"])
- CORS_ALLOW_HEADERS: Comma-separated list or JSON array of HTTP headers (default: ["*"])
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Iterable, List


def _getenv_bool(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


def _getenv_list(name: str, default: Iterable[str]) -> List[str]:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return list(default)
    s = raw.strip()
    if (s.startswith("[") and s.endswith("]")) or (
        s.startswith("(") and s.endswith(")")
    ):
        try:
            parsed = json.loads(s.replace("(", "[").replace(")", "]"))
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed]
        except Exception:
            pass
    return [part.strip() for part in s.split(",") if part.strip()]


@dataclass(frozen=True)
class Settings:
    app_name: str = field(
        default_factory=lambda: os.getenv("APP_NAME", "Timetable Generator API")
    )
    version: str = field(default_factory=lambda: os.getenv("APP_VERSION", "1.0.0"))
    debug: bool = field(default_factory=lambda: _getenv_bool("DEBUG", False))

    allowed_origins: List[str] = field(
        default_factory=lambda: _getenv_list(
            "CORS_ALLOW_ORIGINS",
            default=[
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "https://smart-classroom-timetable-scheduler.onrender.com",
            ],
        )
    )
    allow_credentials: bool = field(
        default_factory=lambda: _getenv_bool("CORS_ALLOW_CREDENTIALS", True)
    )
    allow_methods: List[str] = field(
        default_factory=lambda: _getenv_list("CORS_ALLOW_METHODS", default=["*"])
    )
    allow_headers: List[str] = field(
        default_factory=lambda: _getenv_list("CORS_ALLOW_HEADERS", default=["*"])
    )

    def cors_params(self) -> dict[str, Any]:
        """
        Return keyword arguments suitable for FastAPI's CORSMiddleware.
        """
        return {
            "allow_origins": self.allowed_origins,
            "allow_credentials": self.allow_credentials,
            "allow_methods": self.allow_methods,
            "allow_headers": self.allow_headers,
        }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Cached retrieval of application settings.
    """
    return Settings()


def apply_cors(app: Any, settings: Settings | None = None) -> None:
    """
    Apply CORS middleware to a FastAPI app using the provided or global settings.

    Args:
        app: A FastAPI instance.
        settings: Optional Settings instance. If not provided, uses get_settings().
    """
    settings = settings or get_settings()
    # Import here to avoid hard dependency during module import in non-API contexts.
    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(CORSMiddleware, **settings.cors_params())


__all__ = ["Settings", "get_settings", "apply_cors"]
