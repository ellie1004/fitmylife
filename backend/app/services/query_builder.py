"""
FITT → YouTube 검색 쿼리 변환기

FITT-VP 결과를 YouTube Data API에 적합한 검색 쿼리 문자열로 변환합니다.
신뢰 채널 DB의 매핑 데이터를 활용하여 한국어 키워드를 조합합니다.
"""

from app.models.prescription import FITTResult
from app.services.channel_db import get_channel_db


def build_youtube_query(fitt: FITTResult, target_area: str = "전신") -> str:
    """
    FITT 결과를 YouTube 검색 쿼리로 변환합니다.

    예시 출력: "초보자 홈트 스트레칭 전신 10분"

    Args:
        fitt: FITT-VP 알고리즘 결과
        target_area: 타겟 부위 (예: "전신", "하체", "목어깨")

    Returns:
        YouTube 검색에 사용할 쿼리 문자열
    """
    db = get_channel_db()
    parts: list[str] = []

    # 1) 강도 키워드 (첫 번째 키워드만 사용)
    intensity_keywords = db.get_intensity_keywords(fitt.intensity)
    if intensity_keywords:
        parts.append(intensity_keywords[0])  # 예: "초보자", "중급", "고강도"

    # 2) 운동 컨텍스트
    parts.append("홈트")  # 홈트레이닝 기본 컨텍스트

    # 3) 운동 유형 키워드
    type_keywords = db.get_exercise_keywords(fitt.exercise_type)
    if type_keywords:
        parts.append(type_keywords[0])  # 예: "유산소", "근력", "스트레칭"

    # 4) 타겟 부위
    if target_area and target_area != "전신":
        parts.append(target_area)

    # 5) 운동 시간
    parts.append(f"{fitt.time_minutes}분")

    return " ".join(parts)


def get_duration_filter(time_minutes: int) -> str:
    """
    운동 시간에 맞는 YouTube videoDuration 필터 값을 반환합니다.

    YouTube API 필터:
      - "short": 4분 이하
      - "medium": 4~20분
      - "long": 20분 이상
    """
    db = get_channel_db()

    # duration_mapping에서 적절한 필터 찾기
    for key in ["short", "medium", "long"]:
        info = db.get_duration_info(key)
        if info:
            range_min, range_max = info["range"]
            if range_min <= time_minutes <= range_max:
                return info["youtube_filter"]

    # 기본값: medium (대부분의 운동 영상이 이 범위)
    return "medium"
