"""
FITT-VP 알고리즘 엔진

체크리스트 6개 영역 점수를 분석하여 개인 맞춤 운동처방 파라미터를 산출합니다.
F(빈도), I(강도), T(시간), T(유형), V(운동량), P(점진성)
"""

from app.models.checklist import ChecklistResult
from app.models.prescription import FITTResult


# 운동 유형 우선순위 매핑 — 종합 점수 구간별 추천 유형
_TYPE_BY_SCORE = [
    (30, "flexibility"),   # 낮은 점수 → 유연성 운동부터 시작
    (50, "balance"),       # 중하 → 밸런스 + 가벼운 움직임
    (70, "cardio"),        # 중상 → 유산소 중심
    (100, "strength"),     # 높은 점수 → 근력 운동 포함
]

# 타겟 부위 매핑 — 운동 유형별 기본 타겟
_TARGET_AREA = {
    "flexibility": "전신",
    "balance": "코어",
    "cardio": "전신",
    "strength": "상체·하체",
}


def calculate_fitt(result: ChecklistResult, user_age: int) -> FITTResult:
    """
    체크리스트 결과로부터 FITT-VP 파라미터를 산출합니다.

    Args:
        result: 체크리스트 6개 영역 점수
        user_age: 사용자 나이 (안전 강도 조절에 사용)

    Returns:
        FITTResult — 맞춤 운동 처방 파라미터
    """
    score = result.overall_score

    # ── F (Frequency): 주당 운동 빈도 ──
    # 점수가 낮을수록 적게, 높을수록 자주
    if score < 30:
        frequency = 2
    elif score < 50:
        frequency = 3
    elif score < 70:
        frequency = 4
    else:
        frequency = 5

    # ── I (Intensity): 운동 강도 ──
    # 나이와 점수를 모두 고려하여 안전한 강도 결정
    if score < 35 or user_age >= 65:
        intensity = "low"
    elif score < 65:
        intensity = "moderate"
    else:
        intensity = "high"

    # ── T (Time): 1회 운동 시간 (분) ──
    if score < 30:
        time_minutes = 10
    elif score < 50:
        time_minutes = 15
    elif score < 70:
        time_minutes = 20
    else:
        time_minutes = 30

    # ── T (Type): 운동 유형 ──
    exercise_type = "flexibility"  # 기본값
    for threshold, etype in _TYPE_BY_SCORE:
        if score <= threshold:
            exercise_type = etype
            break

    # ── V (Volume): 운동량 ──
    if score < 40:
        volume = "light"
    elif score < 70:
        volume = "moderate"
    else:
        volume = "heavy"

    # ── P (Progression): 점진성 가이드 ──
    if score < 30:
        progression = "2주마다 운동 시간 5분 증가"
    elif score < 50:
        progression = "2주마다 강도 한 단계 상향"
    elif score < 70:
        progression = "매주 운동 빈도 1회 추가 가능"
    else:
        progression = "세트 수·중량 점진적 증가"

    return FITTResult(
        frequency=frequency,
        intensity=intensity,
        time_minutes=time_minutes,
        exercise_type=exercise_type,
        volume=volume,
        progression=progression,
    )


def get_target_area(exercise_type: str) -> str:
    """운동 유형에 따른 기본 타겟 부위를 반환합니다."""
    return _TARGET_AREA.get(exercise_type, "전신")
