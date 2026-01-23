from pydantic import BaseModel, Field


class CodeRunRequest(BaseModel):
    language: str = Field(default="python")
    code: str = Field(min_length=1, max_length=50_000)


class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    exit_code: int

