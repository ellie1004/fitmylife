"""
YouTube Data API v3 연동 서비스

YouTube 검색, 영상 상세 조회, 필터링·스코어링을 담당합니다.
API Quota를 절약하기 위해 캐싱 레이어와 함께 사용합니다.

주요 흐름:
  쿼리 → search.list 호출 → videos.list로 상세 조회 → 스코어링 → 상위 영상 반환
"""

import math
from dataclasses import dataclass

import httpx

from app.core.config import get_settings
from app.services.channel_db import get_channel_db

# YouTube Data API v3 기본 URL
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


@dataclass
class VideoResult:
    """YouTube 영상 검색 결과를 담는 데이터 클래스"""
    video_id: str
    title: str
    channel_id: str
    channel_title: str
    thumbnail_url: str
    duration_seconds: int    # ISO 8601 → 초 단위로 변환된 영상 길이
    view_count: int
    like_count: int
    score: float             # 스코어링 알고리즘이 산출한 최종 점수


class YouTubeService:
    """YouTube Data API v3를 활용한 영상 검색·필터링·스코어링 서비스"""

    def __init__(self):
        self.settings = get_settings()
        self.channel_db = get_channel_db()

    async def search_videos(
        self,
        query: str,
        duration_filter: str = "medium",
        target_duration_minutes: int = 15,
        max_results: int | None = None,
    ) -> list[VideoResult]:
        """
        YouTube 영상을 검색하고 스코어링하여 상위 결과를 반환합니다.

        Args:
            query: 검색 쿼리 (예: "초보자 홈트 스트레칭 10분")
            duration_filter: "short"(~4분) | "medium"(4~20분) | "long"(20분~)
            target_duration_minutes: 목표 운동 시간 (분). 스코어링에서 길이 매칭에 사용
            max_results: 최종 반환 영상 수 (기본: 5)

        Returns:
            스코어 내림차순으로 정렬된 VideoResult 리스트
        """
        if max_results is None:
            max_results = 5

        # 1단계: search.list로 기본 검색 (100 유닛/회)
        search_results = await self._search_list(query, duration_filter)
        if not search_results:
            return []

        # 2단계: videos.list로 상세 정보 조회 (1 유닛/회 — 거의 무제한)
        video_ids = [item["id"]["videoId"] for item in search_results]
        video_details = await self._videos_list(video_ids)

        # 3단계: 필터링 & 스코어링
        scored_videos = self._score_videos(video_details, target_duration_minutes)

        # 4단계: 점수 내림차순 정렬 후 상위 N개 반환
        scored_videos.sort(key=lambda v: v.score, reverse=True)
        return scored_videos[:max_results]

    async def _search_list(self, query: str, duration_filter: str) -> list[dict]:
        """
        YouTube search.list API를 호출합니다.
        Quota 비용: 100 유닛/회 → 하루 최대 100회 검색 가능 (10,000 유닛 기준)
        """
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "videoDuration": duration_filter,     # short | medium | long
            "videoEmbeddable": "true",            # 임베드 가능한 영상만
            "relevanceLanguage": self.settings.YOUTUBE_RELEVANCE_LANGUAGE,
            "regionCode": self.settings.YOUTUBE_REGION_CODE,
            "order": "relevance",
            "maxResults": self.settings.YOUTUBE_MAX_RESULTS,
            "safeSearch": "strict",               # 안전한 콘텐츠만
            "key": self.settings.YOUTUBE_API_KEY,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(YOUTUBE_SEARCH_URL, params=params)
            response.raise_for_status()
            data = response.json()

        return data.get("items", [])

    async def _videos_list(self, video_ids: list[str]) -> list[dict]:
        """
        YouTube videos.list API로 영상 상세 정보를 가져옵니다.
        Quota 비용: 1 유닛/회 → 상세 조회는 거의 무제한

        한 번에 최대 50개 ID를 쉼표로 묶어서 요청할 수 있습니다.
        """
        if not video_ids:
            return []

        params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": self.settings.YOUTUBE_API_KEY,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(YOUTUBE_VIDEOS_URL, params=params)
            response.raise_for_status()
            data = response.json()

        return data.get("items", [])

    def _score_videos(
        self,
        video_details: list[dict],
        target_duration_minutes: int,
    ) -> list[VideoResult]:
        """
        영상 상세 정보를 기반으로 스코어링합니다.

        스코어링 공식 (CLAUDE.md 기준):
          - 조회수 가중치        : 30%
          - 좋아요/조회수 비율   : 20%
          - 채널 신뢰도 점수     : 30%
          - 영상 길이 매칭도     : 20%
        """
        results: list[VideoResult] = []

        for item in video_details:
            snippet = item["snippet"]
            stats = item.get("statistics", {})
            content = item["contentDetails"]

            video_id = item["id"]
            channel_id = snippet["channelId"]
            view_count = int(stats.get("viewCount", 0))
            like_count = int(stats.get("likeCount", 0))
            duration_seconds = self._parse_duration(content["duration"])

            # ── 개별 점수 산출 ──

            # 1) 조회수 점수 (로그 스케일, 최대 100)
            #    조회수가 높을수록 점수가 높지만 로그로 완화
            view_score = min(math.log10(max(view_count, 1)) * 10, 100)

            # 2) 좋아요 비율 점수
            #    좋아요 / 조회수 비율이 높을수록 양질의 콘텐츠
            if view_count > 0:
                like_ratio = like_count / view_count
                like_score = min(like_ratio * 1000, 100)  # 10% 비율이면 만점
            else:
                like_score = 0

            # 3) 채널 신뢰도 점수
            #    신뢰 채널 DB에 등록된 채널이면 해당 trust_score 사용
            channel_info = self.channel_db.get_channel(channel_id)
            if channel_info:
                trust_score = channel_info["trust_score"]
            else:
                trust_score = 50  # 미등록 채널은 기본 50점

            # 4) 영상 길이 매칭도
            #    목표 운동 시간과 영상 길이의 차이가 작을수록 높은 점수
            target_seconds = target_duration_minutes * 60
            if target_seconds > 0:
                diff_ratio = abs(duration_seconds - target_seconds) / target_seconds
                duration_score = max(100 - diff_ratio * 100, 0)
            else:
                duration_score = 50

            # ── 가중 합산 (총 100점 만점) ──
            total_score = (
                view_score * 0.30
                + like_score * 0.20
                + trust_score * 0.30
                + duration_score * 0.20
            )

            results.append(VideoResult(
                video_id=video_id,
                title=snippet["title"],
                channel_id=channel_id,
                channel_title=snippet["channelTitle"],
                thumbnail_url=snippet["thumbnails"]["high"]["url"],
                duration_seconds=duration_seconds,
                view_count=view_count,
                like_count=like_count,
                score=round(total_score, 2),
            ))

        return results

    @staticmethod
    def _parse_duration(iso_duration: str) -> int:
        """
        ISO 8601 영상 길이 문자열을 초 단위 정수로 변환합니다.
        예: "PT4M13S" → 253, "PT1H2M30S" → 3750

        YouTube API의 contentDetails.duration 형식입니다.
        """
        total = 0
        iso_duration = iso_duration.replace("PT", "")

        # 시간(H) 파싱
        if "H" in iso_duration:
            hours, iso_duration = iso_duration.split("H")
            total += int(hours) * 3600

        # 분(M) 파싱
        if "M" in iso_duration:
            minutes, iso_duration = iso_duration.split("M")
            total += int(minutes) * 60

        # 초(S) 파싱
        if "S" in iso_duration:
            seconds = iso_duration.replace("S", "")
            total += int(seconds)

        return total


# 싱글톤 인스턴스
_youtube_service: YouTubeService | None = None


def get_youtube_service() -> YouTubeService:
    """YouTubeService 싱글톤을 반환합니다."""
    global _youtube_service
    if _youtube_service is None:
        _youtube_service = YouTubeService()
    return _youtube_service
