"""
app/core/exceptions.py — Custom exception hierarchy for Thermosarva.

Every external service failure is wrapped in a typed exception so that
route handlers can produce consistent, structured JSON responses.
"""
from typing import Any, Dict, Optional


class ThermosarvaError(Exception):
    """Base exception for all Thermosarva errors."""
    status_code: int = 500
    error_code: str = "INTERNAL_ERROR"
    message: str = "An unexpected error occurred."

    def __init__(self, message: Optional[str] = None, detail: Optional[Any] = None):
        self.message = message or self.__class__.message
        self.detail = detail
        super().__init__(self.message)

    def to_dict(self) -> Dict[str, Any]:
        payload: Dict[str, Any] = {
            "code": self.error_code,
            "message": self.message,
        }
        if self.detail is not None:
            payload["detail"] = self.detail
        return payload


# ── Location Errors ───────────────────────────────────────────────────────────

class UnsupportedLocationError(ThermosarvaError):
    """Raised when the resolved location is outside the United States."""
    status_code = 422
    error_code = "UNSUPPORTED_LOCATION"
    message = "Thermosarva currently supports locations within the United States."


class LocationNotFoundError(ThermosarvaError):
    """Raised when geocoding returns no results."""
    status_code = 404
    error_code = "LOCATION_NOT_FOUND"
    message = "The provided location could not be resolved. Please try a more specific address."


class InvalidCoordinatesError(ThermosarvaError):
    """Raised when lat/lon values are out of valid range."""
    status_code = 422
    error_code = "INVALID_COORDINATES"
    message = "Coordinates are outside valid geographic bounds."


# ── External Service Errors ───────────────────────────────────────────────────

class FortyGuardError(ThermosarvaError):
    """Raised when FortyGuard returns an error or times out."""
    status_code = 503
    error_code = "ENVIRONMENTAL_DATA_UNAVAILABLE"
    message = "Environmental intelligence data is temporarily unavailable."


class FortyGuardTimeoutError(FortyGuardError):
    """Raised when FortyGuard analysis polling exceeds the maximum wait time."""
    error_code = "FORTYGUARD_TIMEOUT"
    message = "Environmental analysis timed out. Please try again."


class ExternalServiceError(ThermosarvaError):
    """Generic external service failure."""
    status_code = 503
    error_code = "EXTERNAL_SERVICE_ERROR"
    message = "An upstream service is currently unavailable."


class GeocodingError(ExternalServiceError):
    """Raised when the geocoding service fails."""
    error_code = "GEOCODING_ERROR"
    message = "Location lookup service is temporarily unavailable."


class WeatherServiceError(ExternalServiceError):
    """Raised when NOAA NWS fails."""
    error_code = "WEATHER_SERVICE_ERROR"
    message = "Weather data service is temporarily unavailable."


class AirQualityServiceError(ExternalServiceError):
    """Raised when OpenAQ fails."""
    error_code = "AIR_QUALITY_SERVICE_ERROR"
    message = "Air quality data service is temporarily unavailable."


class PlacesServiceError(ExternalServiceError):
    """Raised when Overpass API fails."""
    error_code = "PLACES_SERVICE_ERROR"
    message = "Nearby places service is temporarily unavailable."


# ── Validation Errors ─────────────────────────────────────────────────────────

class AnalysisValidationError(ThermosarvaError):
    """Raised when request payload fails domain-level validation."""
    status_code = 422
    error_code = "ANALYSIS_VALIDATION_ERROR"
    message = "The analysis request contains invalid parameters."
