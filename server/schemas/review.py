from pydantic import BaseModel, Field
from typing import Literal, Optional


class ReviewRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=200000, description="待审查的代码")
    dimensions: list[str] = Field(
        default=["security", "performance", "style", "best_practice"],
        description="审查维度",
    )


class ReviewIssue(BaseModel):
    id: str
    severity: Literal["error", "warning", "info"]
    category: Literal["security", "performance", "style", "best_practice"]
    title: str
    description: str
    suggestion: str
    line_start: int
    line_end: int
    code_snippet: str
    fixed_code: Optional[str] = None
