"""
YouTube 큐레이션 API 라우터

YouTube 영상 검색과 신뢰 채널 조회 기능을 직접 제공합니다.
프론트엔드에서 영상을 직접 검색하거나 채널 정보를 조회할 때 사용합니다.
"""

from fastapi import APIRouter, Query

from app.services.youtube_service import get_youtube_service
from app.services.channel_db import get_channel_db

router = APIRouter(prefix="/api/v1/youtube", tags=["YouTube 큐레이션"])


@router.get("/search")
async def search_videos(
    q: str = Query(..., description="검색 쿼리 (예: '초보자 홈트 스트레칭 10분')"),
    duration: str = Query("medium", description="영상 길이 필터: short|medium|long"),
    target_minutes: int = Query(15, description="목표 운동 시간 (분)"),
    max_results: int = Query(5, ge=1, le=10, description="최대 결과 수"),
):
    """YouTube 영상을 검색하고 스코어링 결과를 반환합니다."""
    yt = get_youtube_service()
    results = await yt.search_videos(
        query=q,
        duration_filter=duration,
        target_duration_minutes=target_minutes,
        max_results=max_results,
    )

    return {
        "success": True,
        "data": [
            {
                "video_id": v.video_id,
                "title": v.title,
                "channel_title": v.channel_title,
                "thumbnail_url": v.thumbnail_url,
                "duration_seconds": v.duration_seconds,
                "view_count": v.view_count,
                "like_count": v.like_count,
                "score": v.score,
            }
            for v in results
        ],
        "message": f"'{q}' 검색 결과 {len(results)}개 영상",
    }


@router.get("/channels")
async def list_trusted_channels():
    """등록된 신뢰 채널 목록을 반환합니다."""
    db = get_channel_db()
    return {
        "success": True,
        "data": db.all_channels(),
        "message": f"신뢰 채널 {db.count()}개",
    }
