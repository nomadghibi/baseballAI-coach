"""
Simple in-process rate limiter for auth endpoints.

Keyed by client IP + action. Uses a sliding-window counter.
NOTE: In-process only — resets on restart and does not work across
multiple workers. Replace with Redis + slowapi for production.
"""

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from threading import Lock

from fastapi import HTTPException, Request, status

_buckets: dict[str, list[datetime]] = defaultdict(list)
_lock = Lock()


def check_rate_limit(
    request: Request,
    action: str,
    max_calls: int = 10,
    window_secs: int = 300,
) -> None:
    """Raise 429 if the caller has exceeded max_calls in the window."""
    ip = request.client.host if request.client else "unknown"
    key = f"{ip}:{action}"
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_secs)

    with _lock:
        recent = [t for t in _buckets[key] if t > cutoff]
        if len(recent) >= max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many {action} attempts. Try again in {window_secs // 60} minutes.",
            )
        recent.append(now)
        _buckets[key] = recent
