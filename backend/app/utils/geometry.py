"""
app/utils/geometry.py — Geographic utility functions.
"""
import math
from typing import Tuple


def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth (in metres).
    Uses the Haversine formula.
    """
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def bounding_box(lat: float, lon: float, radius_m: float) -> Tuple[float, float, float, float]:
    """
    Returns (south, west, north, east) bounding box for a circle of radius_m around (lat, lon).
    """
    R = 6_371_000
    delta_lat = math.degrees(radius_m / R)
    delta_lon = math.degrees(radius_m / (R * math.cos(math.radians(lat))))
    return (lat - delta_lat, lon - delta_lon, lat + delta_lat, lon + delta_lon)


def validate_us_lat_lon(lat: float, lon: float) -> bool:
    """
    Quick bounding-box pre-check for continental US + AK + HI.
    This is a fast pre-filter; full validation is done via Nominatim reverse geocoding.
    """
    # Continental US rough bounds
    if 24.0 <= lat <= 49.5 and -125.0 <= lon <= -66.0:
        return True
    # Alaska rough bounds
    if 51.0 <= lat <= 71.5 and -180.0 <= lon <= -130.0:
        return True
    # Hawaii rough bounds
    if 18.5 <= lat <= 22.5 and -160.5 <= lon <= -154.5:
        return True
    return False


def round_coord(value: float, decimals: int = 4) -> float:
    """Round a coordinate to N decimal places for cache key generation."""
    return round(value, decimals)
