from __future__ import annotations

"""
Example routes for the Timetable API.

This module is a placeholder for future endpoints. It exposes a FastAPI
APIRouter with a few simple handlers useful for smoke tests and scaffolding.
Import and include `router` in your app to activate these routes.
"""

from typing import Any, Dict

from fastapi import APIRouter, Query

router = APIRouter(prefix="/examples", tags=["examples"])


@router.get("/ping")
def ping() -> Dict[str, str]:
    """
    Lightweight liveness check endpoint.

    Returns:
        JSON object indicating service is responsive.
    """
    return {"status": "ok"}


@router.get("/echo")
def echo(
    message: str = Query("hello", description="Message to echo back"),
) -> Dict[str, Any]:
    """
    Echo back a message. Useful for quick wiring tests.

    Args:
        message: The message to echo back.

    Returns:
        A JSON object containing the echoed message.
    """
    return {"message": message, "length": len(message)}


@router.get("/info")
def info() -> Dict[str, Any]:
    """
    Provide basic route metadata for discovery.

    Returns:
        A JSON object listing the example routes available under this router.
    """
    return {
        "base_path": "/examples",
        "endpoints": [
            {"method": "GET", "path": "/examples/ping", "summary": "Liveness check"},
            {"method": "GET", "path": "/examples/echo", "summary": "Echo a message"},
            {
                "method": "GET",
                "path": "/examples/info",
                "summary": "List example endpoints",
            },
        ],
    }


__all__ = ["router"]
