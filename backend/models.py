from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class EvidenceReference(BaseModel):
    document: str = ""
    section: str = ""
    date: str = ""


class AssessmentItem(BaseModel):
    id: str
    text: str
    score: Optional[int] = Field(None, ge=1, le=5)
    na: bool = False
    na_justification: Optional[str] = None
    confidence: Optional[str] = Field(None, pattern="^(High|Medium|Low)$")
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)


class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)


class PracticeArea(BaseModel):
    id: str
    name: str
    weight: float = 0.05
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


class CategoryGroup(BaseModel):
    id: str
    name: str
    practice_areas: list[PracticeArea] = Field(default_factory=list)


class SvcSection(BaseModel):
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


class SvcExtension(BaseModel):
    enabled: bool = False
    sections: list[SvcSection] = Field(default_factory=list)


class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""


class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = Field(default_factory=lambda: datetime.now().isoformat())


class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    practice_area_weights: dict[str, float] = Field(default_factory=dict)
    custom_weights: Optional[dict[str, float]] = None


class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    category_groups: list[CategoryGroup] = Field(default_factory=list)
    svc_enabled: bool = False
    svc_extension: Optional[SvcExtension] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
