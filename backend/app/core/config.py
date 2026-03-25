"""
FitMyLife 백엔드 설정 모듈

환경변수를 로드하고 애플리케이션 전역 설정을 관리합니다.
pydantic-settings를 사용하여 .env 파일과 환경변수를 자동으로 읽어옵니다.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """앱 전체에서 사용하는 설정값을 관리하는 클래스"""

    # ── 앱 기본 정보 ──
    APP_NAME: str = "FitMyLife"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # ── YouTube Data API v3 ──
    YOUTUBE_API_KEY: str = ""
    YOUTUBE_MAX_RESULTS: int = 10          # 한 번 검색 시 최대 결과 수
    YOUTUBE_REGION_CODE: str = "KR"        # 지역 코드 (한국)
    YOUTUBE_RELEVANCE_LANGUAGE: str = "ko" # 한국어 우선 검색

    # ── Anthropic (Claude) API ──
    ANTHROPIC_API_KEY: str = ""

    # ── Redis 캐시 ──
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL_SECONDS: int = 86400  # 24시간 (YouTube 검색 결과 캐싱)

    # ── 데이터베이스 ──
    DATABASE_URL: str = "sqlite:///./fitmylife.db"

    # ── 보안 ──
    SECRET_KEY: str = "change-me-in-production"

    # ── 신뢰 채널 DB 경로 ──
    TRUSTED_CHANNELS_PATH: str = "app/data/trusted_channels.json"

    model_config = {
        "env_file": ".env",        # .env 파일에서 환경변수 자동 로드
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# 싱글톤 인스턴스: 앱 어디서든 get_settings()로 동일한 설정 객체를 가져옴
_settings: Settings | None = None


def get_settings() -> Settings:
    """설정 싱글톤을 반환합니다. 최초 호출 시 한 번만 생성됩니다."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
