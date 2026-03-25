"""
운동처방 API 라우터

체크리스트 결과를 기반으로 FITT-VP 운동처방을 생성하고
YouTube 영상을 큐레이션하여 오늘의 운동 플랜을 제공합니다.
"""

from fastapi import APIRouter

from app.models.checklist import ChecklistSubmission, ChecklistResult
from app.models.prescription import WorkoutPlan, VideoItem
from app.services.fitt_engine import calculate_fitt, get_target_area
from app.services.query_builder import build_youtube_query, get_duration_filter
from app.services.youtube_service import get_youtube_service

router = APIRouter(prefix="/api/v1/prescription", tags=["운동처방"])

# 강도·유형별 한국어 안내 메시지 템플릿
_MESSAGES = {
    "low": "무리하지 않는 선에서 천천히 시작해요! 🌱",
    "moderate": "적당한 강도로 활력을 채워봐요! 💪",
    "high": "오늘도 한계를 넘어봐요! 🔥",
}


@router.post("/generate")
async def generate_prescription(submission: ChecklistSubmission):
    """
    체크리스트 답변으로부터 맞춤 운동처방 + YouTube 영상을 생성합니다.

    흐름: 체크리스트 → 점수 산출 → FITT-VP → 쿼리 생성 → YouTube 검색 → 결과 반환
    """
    # 1) 체크리스트 점수 산출 (checklist API와 동일한 로직)
    from app.api.checklist import QUESTIONS

    category_scores: dict[str, list[int]] = {}
    for answer in submission.answers:
        q = next((q for q in QUESTIONS if q["id"] == answer.question_id), None)
        if q:
            cat = q["category"]
            category_scores.setdefault(cat, []).append(answer.value)

    def avg_score(category: str) -> float:
        scores = category_scores.get(category, [3])
        return round((sum(scores) / len(scores) - 1) / 4 * 100, 1)

    checklist_result = ChecklistResult(
        physical_activity=avg_score("physical_activity"),
        diet=avg_score("diet"),
        sleep=avg_score("sleep"),
        stress=avg_score("stress"),
        health_status=avg_score("health_status"),
        exercise_experience=avg_score("exercise_experience"),
        overall_score=0,
    )
    checklist_result.overall_score = round(
        (checklist_result.physical_activity * 0.25
         + checklist_result.diet * 0.10
         + checklist_result.sleep * 0.15
         + checklist_result.stress * 0.10
         + checklist_result.health_status * 0.15
         + checklist_result.exercise_experience * 0.25), 1
    )

    # 2) FITT-VP 산출
    fitt = calculate_fitt(checklist_result, submission.user_age)
    target_area = get_target_area(fitt.exercise_type)

    # 3) YouTube 검색 쿼리 생성
    query = build_youtube_query(fitt, target_area)
    duration_filter = get_duration_filter(fitt.time_minutes)

    # 4) YouTube 영상 검색 & 스코어링
    yt = get_youtube_service()
    raw_videos = await yt.search_videos(
        query=query,
        duration_filter=duration_filter,
        target_duration_minutes=fitt.time_minutes,
        max_results=5,
    )

    videos = [
        VideoItem(
            video_id=v.video_id,
            title=v.title,
            channel_title=v.channel_title,
            thumbnail_url=v.thumbnail_url,
            duration_seconds=v.duration_seconds,
            view_count=v.view_count,
            score=v.score,
        )
        for v in raw_videos
    ]

    # 5) 결과 조합
    plan = WorkoutPlan(
        fitt=fitt,
        videos=videos,
        search_query=query,
        target_area=target_area,
        message=_MESSAGES.get(fitt.intensity, "오늘도 건강한 하루 보내세요! 😊"),
    )

    return {
        "success": True,
        "data": plan.model_dump(),
        "message": "맞춤 운동처방이 생성되었습니다.",
    }
