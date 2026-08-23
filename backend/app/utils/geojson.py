"""
app/utils/geojson.py — GeoJSON builder utilities.
"""
from typing import Any, Dict, List, Optional


def feature(
    geometry_type: str,
    coordinates: Any,
    properties: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Build a GeoJSON Feature."""
    return {
        "type": "Feature",
        "geometry": {
            "type": geometry_type,
            "coordinates": coordinates,
        },
        "properties": properties or {},
    }


def point_feature(
    lon: float,
    lat: float,
    properties: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Build a GeoJSON Point Feature. Note: GeoJSON is [lon, lat] order."""
    return feature("Point", [lon, lat], properties)


def feature_collection(features: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Build a GeoJSON FeatureCollection."""
    return {
        "type": "FeatureCollection",
        "features": features,
    }


def thermal_feature(
    lon: float,
    lat: float,
    radius_m: float,
    temperature: float,
    timestamp: str,
    extra_props: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Build a thermal region GeoJSON Feature (represented as a Point with radius metadata)."""
    props: Dict[str, Any] = {
        "temperature": temperature,
        "timestamp": timestamp,
        "radius_m": radius_m,
    }
    if extra_props:
        props.update(extra_props)
    return point_feature(lon, lat, props)


def poi_feature(
    name: str,
    category: str,
    lon: float,
    lat: float,
    distance_m: Optional[float] = None,
    opening_hours: Optional[str] = None,
    extra_props: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Build a POI GeoJSON Feature."""
    props: Dict[str, Any] = {
        "name": name,
        "category": category,
    }
    if distance_m is not None:
        props["distance_m"] = round(distance_m)
    if opening_hours:
        props["opening_hours"] = opening_hours
    if extra_props:
        props.update(extra_props)
    return point_feature(lon, lat, props)


def map_bounds_from_center(
    lat: float, lon: float, zoom: int = 12
) -> List[List[float]]:
    """
    Approximate map bounds for a given center and zoom.
    Returns [[sw_lon, sw_lat], [ne_lon, ne_lat]].
    """
    delta = 0.5 / (2 ** (zoom - 10))
    return [
        [lon - delta, lat - delta],
        [lon + delta, lat + delta],
    ]
