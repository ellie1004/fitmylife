"""
신뢰 채널 DB 로더 (channel_db.py)

trusted_channels.json 파일을 로드하여 채널 조회·검색 기능을 제공합니다.
YouTube 큐레이션 시 신뢰 채널의 영상을 우선 추천하기 위해 사용됩니다.

데이터 구조 (trusted_channels.json):
  - channels: 채널 목록 (이름, ID, 태그, 신뢰도 점수 등)
  - exercise_type_mapping: 운동 유형 → 한국어 키워드 매핑
  - intensity_mapping: 강도 레벨 → 한국어 키워드 매핑
  - duration_mapping: 영상 길이 분류 및 YouTube 필터값 매핑
"""

import json
from pathlib import Path

from app.core.config import get_settings


class ChannelDB:
    """
    신뢰 채널 데이터베이스.
    JSON 파일에서 채널 목록을 로드하고, 채널 ID·태그·운동 유형 등으로
    빠르게 조회할 수 있는 인터페이스를 제공합니다.
    """

    def __init__(self, json_path: str | None = None):
        """
        Args:
            json_path: trusted_channels.json 파일 경로.
                       None이면 config의 기본 경로 사용.
        """
        if json_path is None:
            json_path = get_settings().TRUSTED_CHANNELS_PATH

        self._data = self._load(json_path)

        # 채널 ID → 채널 정보 딕셔너리 (빠른 조회용 인덱스)
        self._channel_index: dict[str, dict] = {
            ch["channel_id"]: ch for ch in self._data.get("channels", [])
        }

    @staticmethod
    def _load(json_path: str) -> dict:
        """JSON 파일을 읽어 파싱합니다."""
        path = Path(json_path)
        if not path.exists():
            raise FileNotFoundError(
                f"신뢰 채널 DB 파일을 찾을 수 없습니다: {json_path}"
            )
        with open(path, encoding="utf-8") as f:
            return json.load(f)

    # ── 채널 조회 ──

    def get_channel(self, channel_id: str) -> dict | None:
        """채널 ID로 신뢰 채널 정보를 조회합니다. 미등록 채널이면 None 반환."""
        return self._channel_index.get(channel_id)

    def is_trusted(self, channel_id: str) -> bool:
        """해당 채널이 신뢰 목록에 등록되어 있는지 확인합니다."""
        return channel_id in self._channel_index

    def count(self) -> int:
        """등록된 신뢰 채널 수를 반환합니다."""
        return len(self._channel_index)

    def all_channels(self) -> list[dict]:
        """전체 신뢰 채널 목록을 반환합니다."""
        return self._data.get("channels", [])

    # ── 태그·유형 기반 필터링 ──

    def find_by_tags(self, tags: list[str]) -> list[dict]:
        """
        주어진 태그 중 하나라도 포함하는 채널을 반환합니다.
        신뢰도 점수(trust_score) 내림차순으로 정렬됩니다.

        Args:
            tags: 검색할 태그 목록 (예: ["홈트", "초보자"])

        Returns:
            매칭된 채널 목록 (trust_score 내림차순)
        """
        tag_set = set(tags)
        matched = [
            ch for ch in self.all_channels()
            if tag_set & set(ch.get("tags", []))
        ]
        matched.sort(key=lambda ch: ch["trust_score"], reverse=True)
        return matched

    def find_by_exercise_type(self, exercise_type: str) -> list[dict]:
        """
        운동 유형으로 채널을 필터링합니다.

        Args:
            exercise_type: 운동 유형 키 (예: "cardio", "strength", "flexibility")

        Returns:
            해당 유형을 지원하는 채널 목록
        """
        return [
            ch for ch in self.all_channels()
            if exercise_type in ch.get("exercise_types", [])
        ]

    def find_by_difficulty(self, difficulty: str) -> list[dict]:
        """
        난이도로 채널을 필터링합니다.

        Args:
            difficulty: 난이도 키 (예: "beginner", "intermediate", "advanced")

        Returns:
            해당 난이도를 지원하는 채널 목록
        """
        return [
            ch for ch in self.all_channels()
            if difficulty in ch.get("difficulty", [])
        ]

    # ── 매핑 데이터 조회 ──

    def get_exercise_keywords(self, exercise_type: str) -> list[str]:
        """
        운동 유형에 대응하는 한국어 검색 키워드 목록을 반환합니다.
        예: "cardio" → ["유산소", "달리기", "걷기", "줄넘기", ...]
        """
        mapping = self._data.get("exercise_type_mapping", {})
        return mapping.get(exercise_type, [])

    def get_intensity_keywords(self, intensity: str) -> list[str]:
        """
        강도 레벨에 대응하는 한국어 검색 키워드 목록을 반환합니다.
        예: "low" → ["초보자", "입문", "쉬운", "가벼운", "시니어"]
        """
        mapping = self._data.get("intensity_mapping", {})
        return mapping.get(intensity, [])

    def get_duration_info(self, duration_key: str) -> dict | None:
        """
        영상 길이 분류에 대한 정보를 반환합니다.
        예: "medium" → {"label": "보통 운동", "range": [10, 30], "youtube_filter": "medium"}
        """
        mapping = self._data.get("duration_mapping", {})
        return mapping.get(duration_key)


# 싱글톤 인스턴스
_channel_db: ChannelDB | None = None


def get_channel_db() -> ChannelDB:
    """ChannelDB 싱글톤을 반환합니다. 최초 호출 시 JSON 파일을 로드합니다."""
    global _channel_db
    if _channel_db is None:
        _channel_db = ChannelDB()
    return _channel_db
