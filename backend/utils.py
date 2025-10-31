from typing import Optional, Dict, Any
from fastapi import HTTPException


class APIException(HTTPException):
    def __init__(
        self,
        localization_key: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.localization_key = localization_key
        self.details = details or {}
        super().__init__(status_code=status_code, detail=None)
