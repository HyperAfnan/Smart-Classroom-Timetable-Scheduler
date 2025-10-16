"""
Core utility helpers for the Timetable API.

This module intentionally has zero third-party dependencies and provides:
- Lightweight logging configuration and structured helpers
- Simple timing and tracing decorators
- Context helpers for request correlation IDs
- Small, frequently useful collection utilities

These are designed to be generic and easily reused across routes and services.
"""

from __future__ import annotations

import contextlib
import functools
import logging
import os
import random
import time
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone
from types import TracebackType
from collections.abc import Iterable as _Iterable
from typing import (
    Any,
    Callable,
    Iterable,
    Iterator,
    List,
    Mapping,
    MutableMapping,
    Optional,
    TypeVar,
)

T = TypeVar("T")
K = TypeVar("K")
V = TypeVar("V")


# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------
def configure_logging(level: Optional[str] = None) -> None:
    """
    Configure root logging once. Subsequent calls are no-ops if handlers exist.

    Args:
        level: Optional log level name (e.g. "DEBUG", "INFO"). If not provided,
               uses env LOG_LEVEL (default: INFO).
    """
    if logging.getLogger().handlers:
        return

    env_level = (level or os.getenv("LOG_LEVEL", "INFO")).upper()
    try:
        lvl = getattr(logging, env_level, logging.INFO)
    except Exception:
        lvl = logging.INFO

    logging.basicConfig(
        level=lvl,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Retrieve a module or application logger. Ensures logging is configured.

    Args:
        name: Optional logger name. Defaults to __name__ of the caller module.

    Returns:
        A configured logging.Logger instance.
    """
    configure_logging()
    return logging.getLogger(name or __name__)


# -----------------------------------------------------------------------------
# Correlation / Request ID handling
# -----------------------------------------------------------------------------
_request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def get_request_id() -> Optional[str]:
    """
    Get the current request ID from context, if any.
    """
    return _request_id_ctx.get()


def set_request_id(value: Optional[str]) -> None:
    """
    Set the current request ID in context (None clears it).
    """
    _request_id_ctx.set(value)


@contextlib.contextmanager
def use_request_id(request_id: Optional[str] = None) -> Iterator[str]:
    """
    Context manager to set a request ID for the duration of a block.

    Args:
        request_id: Optional ID. If not provided, generates a UUID4.

    Yields:
        The active request ID string.
    """
    token = _request_id_ctx.set(request_id or str(uuid.uuid4()))
    try:
        yield _request_id_ctx.get() or ""
    finally:
        _request_id_ctx.reset(token)


# -----------------------------------------------------------------------------
# Timing / Tracing
# -----------------------------------------------------------------------------
class Timer:
    """
    Simple context manager to measure elapsed time in seconds with high precision.

    Example:
        with Timer() as t:
            do_work()
        print(t.elapsed)
    """

    def __init__(self) -> None:
        self._start: float = 0.0
        self.elapsed: float = 0.0

    def __enter__(self) -> "Timer":
        self._start = time.perf_counter()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.elapsed = time.perf_counter() - self._start


def time_it(fn: Callable[..., T]) -> Callable[..., T]:
    """
    Decorator to measure function execution time. Adds attribute `last_elapsed`
    on the wrapped function for introspection in tests if needed.
    """

    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        with Timer() as t:
            result = fn(*args, **kwargs)
        setattr(wrapper, "last_elapsed", t.elapsed)  # type: ignore[attr-defined]
        return result

    return wrapper  # type: ignore[return-value]


def trace(level: int = logging.DEBUG) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """
    Decorator to log function entry/exit with duration and request ID.
    Only logs names of kwargs to avoid leaking sensitive data.

    Args:
        level: Logging level for trace messages (default: DEBUG).
    """

    def decorator(fn: Callable[..., T]) -> Callable[..., T]:
        log = get_logger(fn.__module__)

        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            rid = get_request_id()
            arg_count = len(args)
            kwarg_keys = list(kwargs.keys())
            log.log(
                level,
                "enter %s request_id=%s args=%d kwargs=%s",
                fn.__qualname__,
                rid,
                arg_count,
                kwarg_keys,
            )
            with Timer() as t:
                result = fn(*args, **kwargs)
            log.log(
                level,
                "exit %s request_id=%s elapsed=%.6fs",
                fn.__qualname__,
                rid,
                t.elapsed,
            )
            return result

        return wrapper

    return decorator


def log_exceptions(
    logger: Optional[logging.Logger] = None, *, reraise: bool = True
) -> Callable[[Callable[..., T]], Callable[..., Optional[T]]]:
    """
    Decorator to log unhandled exceptions. Optionally swallows exceptions.

    Args:
        logger: Optional logger. If not provided, uses module logger.
        reraise: If True, re-raise the exception after logging.

    Returns:
        Wrapped callable.
    """
    log = logger or get_logger()

    def decorator(fn: Callable[..., T]) -> Callable[..., Optional[T]]:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs) -> Optional[T]:
            try:
                return fn(*args, **kwargs)
            except Exception:
                rid = get_request_id()
                log.exception(
                    "Unhandled error in %s request_id=%s", fn.__qualname__, rid
                )
                if reraise:
                    raise
                # else, return None/False depending on annotation expectations:
                return None

        return wrapper

    return decorator


# -----------------------------------------------------------------------------
# Collections / General helpers
# -----------------------------------------------------------------------------
def chunked(iterable: Iterable[T], size: int) -> Iterator[List[T]]:
    """
    Yield items from iterable in fixed-size chunks.

    Args:
        iterable: Source iterable.
        size: Chunk size (must be >= 1).

    Yields:
        Lists of up to `size` items.
    """
    if size < 1:
        raise ValueError("size must be >= 1")
    chunk: List[T] = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def flatten(nested: Iterable[Iterable[T]]) -> List[T]:
    """
    Flatten an iterable of iterables into a single list.
    """
    return [item for sub in nested for item in sub]


def ensure_list(value: object | None) -> list[Any]:
    """
    Ensure the input is returned as a list.

    Rules:
    - None -> []
    - Iterable (except str/bytes) -> list(value)
    - Other -> [value]
    """
    if value is None:
        return []
    if isinstance(value, (str, bytes)):
        return [value]
    if isinstance(value, _Iterable):
        return list(value)
    return [value]


def deep_freeze(obj: Any) -> Any:
    """
    Convert a nested structure into an immutable representation.
    - dict -> tuple of sorted (key, value) pairs (keys preserved as-is)
    - list/tuple/set -> tuple of frozen items
    - other -> returned as-is
    """
    if isinstance(obj, Mapping):
        return tuple(
            (k, deep_freeze(v))
            for k, v in sorted(obj.items(), key=lambda kv: str(kv[0]))
        )
    if isinstance(obj, (list, tuple, set)):
        return tuple(deep_freeze(x) for x in obj)
    return obj


def dict_merge(
    base: MutableMapping[Any, Any],
    incoming: Mapping[Any, Any],
    *,
    deep: bool = True,
) -> MutableMapping[Any, Any]:
    """
    Merge 'incoming' into 'base'. If deep=True, merge nested dicts recursively.

    Returns:
        The mutated 'base' mapping.
    """
    for k, v in incoming.items():
        if (
            deep
            and k in base
            and isinstance(base[k], Mapping)
            and isinstance(v, Mapping)
        ):
            dict_merge(base[k], v, deep=True)
        else:
            base[k] = v
    return base


def now_utc_iso() -> str:
    """
    Current UTC timestamp in ISO-8601 format.
    """
    return datetime.now(timezone.utc).isoformat()


def parse_comma_separated(value: Optional[str]) -> List[str]:
    """
    Parse a comma-separated string into a list of trimmed items.
    Empty or None returns [].
    """
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def set_random_seed(seed: Optional[int] = None) -> None:
    """
    Seed Python's RNG and, when available, NumPy's RNG for reproducibility.

    Args:
        seed: Seed value. If None, a deterministic seed is derived from env or time.
    """
    if seed is None:
        # Prefer explicit env, otherwise derive from current time
        env_seed = os.getenv("PY_SEED")
        if env_seed and env_seed.isdigit():
            seed = int(env_seed)
        else:
            seed = int(time.time() * 1000) & 0xFFFFFFFF

    random.seed(seed)
    try:
        import numpy as _np  # type: ignore

        _np.random.seed(seed)
    except Exception:
        # NumPy not installed or failed to seed; ignore
        pass


__all__ = [
    # logging
    "configure_logging",
    "get_logger",
    # request id
    "get_request_id",
    "set_request_id",
    "use_request_id",
    # timing / tracing
    "Timer",
    "time_it",
    "trace",
    "log_exceptions",
    # collections / helpers
    "chunked",
    "flatten",
    "ensure_list",
    "deep_freeze",
    "dict_merge",
    "now_utc_iso",
    "parse_comma_separated",
    "set_random_seed",
]
