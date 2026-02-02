#!/usr/bin/env python3
"""
Run entrypoint for the Timetable API.

This script launches the FastAPI application defined in `src.main:src`
using Uvicorn. It supports configuration via command-line arguments and environment
variables. Command-line options take precedence over environment variables.

Environment variables:
- HOST: Bind address (default: "0.0.0.0")
- PORT: Bind port (default: "8000")
- RELOAD: Enable auto-reload (true/false) (default: "false")
- WORKERS: Number of worker processes (ignored when reload is true) (default: "1")
- LOG_LEVEL: Uvicorn log level (default: "info")

Usage:
  python -m timetable_api.run
  python algorithm-microservice/timetable_api/run.py --host 127.0.0.1 --port 9000 --reload
"""

from __future__ import annotations

import argparse
import os
from typing import Optional

import uvicorn


# Ensure project root is on sys.path so imports work when running from the timetable_api directory
import sys
from pathlib import Path as _Path

_APP_FILE = _Path(__file__).resolve()
_PROJECT_ROOT = _APP_FILE.parents[1]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

APP_IMPORT_PATH = "src.main:app"


def _parse_bool(value: Optional[str], default: bool = False) -> bool:
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _env(key: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(key, default)


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the Timetable API server.")
    parser.add_argument(
        "--host",
        default=None,
        help=f"Bind address (env HOST, default {_env('HOST', '0.0.0.0')})",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help=f"Bind port (env PORT, default {_env('PORT', '8000')})",
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload (env RELOAD)",
    )
    parser.add_argument(
        "--no-reload",
        action="store_true",
        help="Disable auto-reload (overrides --reload)",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help=f"Number of worker processes (env WORKERS, default {_env('WORKERS', '1')}). Ignored if reload is enabled.",
    )
    parser.add_argument(
        "--log-level",
        default=None,
        choices=["critical", "error", "warning", "info", "debug", "trace"],
        help=f"Log level (env LOG_LEVEL, default {_env('LOG_LEVEL', 'info')})",
    )
    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    # Resolve settings: CLI overrides env, env overrides defaults
    host: str = args.host or _env("HOST", "0.0.0.0") or "0.0.0.0"
    port_str: str = _env("PORT", "8000") or "8000"
    port = args.port if args.port is not None else int(port_str)

    env_reload = _parse_bool(_env("RELOAD"), default=False)
    reload_enabled: bool = env_reload or args.reload
    if args.no_reload:
        reload_enabled = False

    workers_env: int = int((_env("WORKERS", "1") or "1"))
    workers: int = args.workers if args.workers is not None else workers_env

    log_level: str = args.log_level or (_env("LOG_LEVEL", "info") or "info")

    # Uvicorn does not allow multiple workers with reload=True
    if reload_enabled and workers > 1:
        workers = 1

    uvicorn.run(
        APP_IMPORT_PATH,
        host=host,
        port=port,
        reload=reload_enabled,
        workers=workers,
        log_level=log_level,
    )


if __name__ == "__main__":
    main()
