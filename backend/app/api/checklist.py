"""
체크리스트 API 라우터

사용자의 라이프스타일 체크리스트 제출 및 분석 결과를 제공합니다.
"""

from fastapi import APIRouter

from app.models.checklist import ChecklistSubmission, ChecklistResult

router = APIRouter(prefix="/api/v1/checklist", tags=["체크리스트"])

# ── 체크리스트 질문 목록 (6개 영역, 영역당 3문항 = 총 18문항) ──
QUESTIONS = [
    # 신체활동 (Physical Activity)
    {"id": "pa_01", "category": "physical_activity", "text": "일주일에 30분 이상 운동을 몇 번 하시나요?",
     "options": ["거의 안 함", "1~2회", "3~4회", "5회 이상", "매일"]},
    {"id": "pa_02", "category": "physical_activity", "text": "하루에 앉아있는 시간이 얼마나 되나요?",
     "options": ["10시간 이상", "8~10시간", "6~8시간", "4~6시간", "4시간 미만"]},
    {"id": "pa_03", "category": "physical_activity", "text": "평소 계단 오르기나 걷기를 선호하시나요?",
     "options": ["전혀 아님", "가끔", "보통", "자주", "항상"]},

    # 식습관 (Diet)
    {"id": "dt_01", "category": "diet", "text": "하루 세끼를 규칙적으로 드시나요?",
     "options": ["거의 못함", "1끼 정도", "2끼 정도", "대체로 규칙적", "매우 규칙적"]},
    {"id": "dt_02", "category": "diet", "text": "채소와 과일을 충분히 섭취하시나요?",
     "options": ["거의 안 먹음", "가끔", "보통", "자주", "매일 충분히"]},
    {"id": "dt_03", "category": "diet", "text": "물을 하루에 얼마나 드시나요?",
     "options": ["2잔 이하", "3~4잔", "5~6잔", "7~8잔", "8잔 이상"]},

    # 수면 (Sleep)
    {"id": "sl_01", "category": "sleep", "text": "평균 수면 시간은 얼마인가요?",
     "options": ["5시간 미만", "5~6시간", "6~7시간", "7~8시간", "8시간 이상"]},
    {"id": "sl_02", "category": "sleep", "text": "수면의 질에 만족하시나요?",
     "options": ["매우 불만족", "불만족", "보통", "만족", "매우 만족"]},
    {"id": "sl_03", "category": "sleep", "text": "규칙적인 시간에 잠들고 일어나시나요?",
     "options": ["전혀", "거의 안 됨", "보통", "대체로", "매우 규칙적"]},

    # 스트레스 (Stress)
    {"id": "st_01", "category": "stress", "text": "최근 스트레스 수준은 어떤가요?",
     "options": ["매우 높음", "높음", "보통", "낮음", "매우 낮음"]},
    {"id": "st_02", "category": "stress", "text": "스트레스 해소를 위한 활동을 하고 계신가요?",
     "options": ["전혀 없음", "거의 없음", "가끔", "자주", "매우 자주"]},
    {"id": "st_03", "category": "stress", "text": "일과 생활의 균형에 만족하시나요?",
     "options": ["매우 불만족", "불만족", "보통", "만족", "매우 만족"]},

    # 건강상태 (Health Status)
    {"id": "hs_01", "category": "health_status", "text": "현재 만성 질환이나 통증이 있으신가요?",
     "options": ["심각한 문제", "여러 가지", "한두 가지", "경미한 것만", "없음"]},
    {"id": "hs_02", "category": "health_status", "text": "전반적인 체력 상태는 어떻다고 느끼시나요?",
     "options": ["매우 낮음", "낮음", "보통", "좋음", "매우 좋음"]},
    {"id": "hs_03", "category": "health_status", "text": "최근 6개월 내 건강검진을 받으셨나요?",
     "options": ["3년 이상 전", "1~3년 전", "1년 이내", "6개월 이내", "정기적으로"]},

    # 운동경험 (Exercise Experience)
    {"id": "ex_01", "category": "exercise_experience", "text": "규칙적인 운동 경험이 있으신가요?",
     "options": ["전혀 없음", "과거에 잠깐", "간헐적", "꾸준히 1년 이상", "전문 수준"]},
    {"id": "ex_02", "category": "exercise_experience", "text": "어떤 운동을 해보셨나요? (가장 익숙한 것)",
     "options": ["없음", "걷기 정도", "요가/스트레칭", "달리기/수영 등", "웨이트/구기 등"]},
    {"id": "ex_03", "category": "exercise_experience", "text": "운동 기구나 시설을 이용할 수 있나요?",
     "options": ["전혀 없음", "매트 정도", "덤벨·밴드 등", "홈짐 수준", "헬스장 이용"]},
]


@router.get("/questions")
async def get_questions():
    """체크리스트 질문 목록을 반환합니다."""
    return {
        "success": True,
        "data": QUESTIONS,
        "message": f"총 {len(QUESTIONS)}개 질문을 불러왔습니다.",
    }


@router.post("/submit")
async def submit_checklist(submission: ChecklistSubmission):
    """
    체크리스트 답변을 제출하고 분석 결과를 반환합니다.
    각 영역별 평균 점수를 0~100 스케일로 변환합니다.
    """
    # 카테고리별로 답변 점수 모으기
    category_scores: dict[str, list[int]] = {}
    for answer in submission.answers:
        # question_id에서 카테고리 추출 (예: "pa_01" → "pa")
        q = next((q for q in QUESTIONS if q["id"] == answer.question_id), None)
        if q:
            cat = q["category"]
            category_scores.setdefault(cat, []).append(answer.value)

    def avg_score(category: str) -> float:
        """카테고리 평균 → 0~100 스케일 변환 (1~5점 → 0~100)"""
        scores = category_scores.get(category, [3])
        return round((sum(scores) / len(scores) - 1) / 4 * 100, 1)

    result = ChecklistResult(
        physical_activity=avg_score("physical_activity"),
        diet=avg_score("diet"),
        sleep=avg_score("sleep"),
        stress=avg_score("stress"),
        health_status=avg_score("health_status"),
        exercise_experience=avg_score("exercise_experience"),
        overall_score=0,
    )

    # 종합 점수: 6개 영역의 가중 평균
    result.overall_score = round(
        (result.physical_activity * 0.25
         + result.diet * 0.10
         + result.sleep * 0.15
         + result.stress * 0.10
         + result.health_status * 0.15
         + result.exercise_experience * 0.25) , 1
    )

    return {
        "success": True,
        "data": result.model_dump(),
        "message": "체크리스트 분석이 완료되었습니다.",
    }
