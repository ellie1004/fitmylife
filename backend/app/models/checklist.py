"""
체크리스트 데이터 모델

사용자의 라이프스타일 진단을 위한 체크리스트 질문·응답 스키마를 정의합니다.
6개 영역: 신체활동, 식습관, 수면, 스트레스, 건강상태, 운동경험
"""

from pydantic import BaseModel, Field


class ChecklistAnswer(BaseModel):
    """개별 질문에 대한 답변"""
    question_id: str       # 질문 고유 ID (예: "pa_01")
    value: int = Field(ge=1, le=5)  # 1~5점 리커트 척도


class ChecklistSubmission(BaseModel):
    """체크리스트 전체 제출 데이터"""
    answers: list[ChecklistAnswer]
    user_age: int = Field(ge=10, le=100)
    user_gender: str = Field(pattern="^(male|female|other)$")
    user_height: float | None = None   # cm
    user_weight: float | None = None   # kg


class ChecklistResult(BaseModel):
    """체크리스트 분석 결과 — 6개 영역별 점수"""
    physical_activity: float   # 신체활동 점수 (0~100)
    diet: float                # 식습관
    sleep: float               # 수면
    stress: float              # 스트레스
    health_status: float       # 건강상태
    exercise_experience: float # 운동경험
    overall_score: float       # 종합 점수
