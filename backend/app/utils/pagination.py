from typing import TypeVar, Generic, List
from pydantic import BaseModel

T = TypeVar('T')


class PaginationParams(BaseModel):
    """Pagination parameters."""
    limit: int = 20
    offset: int = 0
    
    def validate_limits(self):
        """Ensure pagination parameters are within acceptable ranges."""
        if self.limit > 100:
            self.limit = 100
        if self.limit < 1:
            self.limit = 1
        if self.offset < 0:
            self.offset = 0
