"""
Shared response models for consistent API response structure across all endpoints.
"""
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class StandardResponse(BaseModel, Generic[T]):
    """Wraps successful responses with a consistent envelope."""

    status: str = "ok"
    data: Optional[T] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Consistent error response body returned for all error scenarios."""

    status: str = "error"
    error: ErrorDetail

    @classmethod
    def of(
        cls,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ) -> "ErrorResponse":
        return cls(error=ErrorDetail(code=code, message=message, details=details))
