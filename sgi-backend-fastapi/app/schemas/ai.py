from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str = Field(..., pattern=r"^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    context: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    message: str
    sources: List[str] = []


class PolicyGenerationRequest(BaseModel):
    policy_type: str = Field(..., description="Tipo: politica, procedimiento, lineamiento")
    title: str = Field(..., min_length=2, max_length=200)
    scope: str = Field(..., min_length=10, max_length=1000)
    iso_references: List[str] = []
    additional_context: Optional[str] = None


class PolicyGenerationResponse(BaseModel):
    title: str
    content: str
    iso_references: List[str]
    sections: List[str]


class GapAnalysisRequest(BaseModel):
    standard: str = Field(default="ISO 27001:2022", max_length=100)
    scope_description: str = Field(..., min_length=10, max_length=2000)
    organization_id: Optional[str] = None


class GapAnalysisItem(BaseModel):
    control_id: str
    control_name: str
    category: str
    status: str
    gap_description: str
    recommendation: str
    priority: str


class GapAnalysisResponse(BaseModel):
    standard: str
    total_controls: int
    implemented: int
    gaps: List[GapAnalysisItem]
    compliance_score: float
    summary: str


class RecommendationRequest(BaseModel):
    context: str = Field(..., min_length=10, max_length=2000)
    module: str = Field(..., pattern=r"^(risks|controls|assets|documents|incidents)$")


class RecommendationResponse(BaseModel):
    recommendations: List[str]
    priority_actions: List[str]
    related_controls: List[str]


class AIChatSession(BaseModel):
    id: str
    user_id: str
    title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
