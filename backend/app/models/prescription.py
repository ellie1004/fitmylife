"""
운동처방 데이터 모델

FITT-VP 알고리즘 기반 운동처방 결과와 YouTube 큐레이션 결과 스키마.
"""

from pydantic import BaseModel


class FITTResult(BaseModel):
    """FITT-VP 알고리즘 산출 결과"""
    frequency: int             # F: 주당 운동 빈도 (회/주)
    intensity: str             # I: 강도 ("low" | "moderate" | "high")
    time_minutes: int          # T: 1회 운동 시간 (분)
    exercise_type: str         # T: 운동 유형 ("cardio" | "strength" | "flexibility" | "balance")
    volume: str                # V: 운동량 레벨 ("light" | "moderate" | "heavy")
    progression: str           # P: 점진성 가이드 텍스트


class VideoItem(BaseModel):
    """추천 YouTube 영상 정보"""
    video_id: str
    title: str
    channel_title: str
    thumbnail_url: str
    duration_seconds: int
    view_count: int
    score: float


class WorkoutPlan(BaseModel):
    """오늘의 운동 플랜 — FITT 결과 + 추천 영상"""
    fitt: FITTResult
    videos: list[VideoItem]
    search_query: str          # 사용된 YouTube 검색 쿼리
    target_area: str           # 타겟 부위 (예: "전신", "하체", "목어깨")
    message: str               # 사용자에게 보여줄 한국어 안내 메시지
