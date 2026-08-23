"""
app/utils/time.py — Date and time utility functions.
"""
import datetime
from typing import Optional


def utc_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat()


def today_date_str() -> str:
    """Returns today's date as YYYY-MM-DD in UTC."""
    return utc_now().strftime("%Y-%m-%d")


def parse_date(date_str: Optional[str]) -> datetime.date:
    """Parse YYYY-MM-DD string to date. Falls back to today."""
    if not date_str:
        return utc_now().date()
    return datetime.date.fromisoformat(date_str)


def parse_time(time_str: Optional[str]) -> datetime.time:
    """Parse HH:MM string to time. Falls back to current UTC time."""
    if not time_str:
        return utc_now().time().replace(second=0, microsecond=0)
    return datetime.time.fromisoformat(time_str)


def generate_12h_timestamps(
    date_str: str, start_time_str: str, interval_hours: int = 1
) -> list[str]:
    """
    Generate a list of 12 ISO 8601 timestamps starting from date+time,
    spaced by interval_hours.
    """
    base = datetime.datetime.fromisoformat(f"{date_str}T{start_time_str}:00")
    return [
        (base + datetime.timedelta(hours=i * interval_hours)).isoformat()
        for i in range(12)
    ]


def minutes_to_hours(minutes: int) -> float:
    return minutes / 60.0
