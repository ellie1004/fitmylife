"""
FitMyLife FastAPI 메인 엔트리포인트

앱 생성, 미들웨어 등록, 라우터 마운트를 담당합니다.
실행: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    앱 시작/종료 시 실행되는 라이프사이클 훅.
    - 시작: 설정 로드 확인, 신뢰 채널 DB 프리로드
    - 종료: 리소스 정리
    """
    settings = get_settings()
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 시작")

    # 신뢰 채널 DB를 미리 로드하여 첫 요청 지연을 방지
    from app.services.channel_db import get_channel_db
    channel_db = get_channel_db()
    print(f"📺 신뢰 채널 {channel_db.count()}개 로드 완료")

    yield  # 앱 실행 중

    print(f"👋 {settings.APP_NAME} 종료")


app = FastAPI(
    title="FitMyLife API",
    description="AI 맞춤 운동처방 + YouTube 큐레이션 API",
    version=get_settings().APP_VERSION,
    lifespan=lifespan,
)

# ── CORS 설정: 모바일 앱·개발 서버에서의 요청 허용 ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # 프로덕션에서는 특정 도메인으로 제한할 것
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 헬스체크 엔드포인트 ──
@app.get("/api/v1/health")
async def health_check():
    """서버 상태 확인용 엔드포인트"""
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "version": get_settings().APP_VERSION,
        },
        "message": "서버가 정상 작동 중입니다.",
    }
