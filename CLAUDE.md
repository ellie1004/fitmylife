# FitMyLife - AI 맞춤 운동처방 앱 (YouTube 큐레이션 버전)

## 프로젝트 개요
라이프스타일 체크리스트 진단 → FITT-VP 알고리즘으로 운동 프로그램 산출 → YouTube 영상을 AI가 자동 큐레이션하여 제공하는 모바일 앱.
자체 영상 제작 없이 YouTube Data API v3로 검증된 운동 영상을 매칭합니다.

## 기술 스택
- **프론트엔드**: React Native (Expo SDK 52) + TypeScript
- **상태관리**: Zustand
- **스타일링**: NativeWind (Tailwind CSS for React Native)
- **백엔드**: FastAPI (Python 3.11+)
- **AI 엔진**: Claude API (Anthropic) - 운동처방 추론 + 쿼리 생성
- **YouTube**: YouTube Data API v3 - 영상 검색·필터링·임베드
- **데이터베이스**: SQLite (MVP) → PostgreSQL (스케일업)
- **캐싱**: Redis (YouTube API 응답 캐싱, Quota 절약)
- **인증**: Firebase Auth
- **클라우드**: Vercel (백엔드) + Expo EAS (앱 빌드)

## 디렉토리 구조
```
fitmylife/
├── mobile/                      # React Native 앱 (Expo)
│   ├── src/
│   │   ├── screens/
│   │   │   ├── OnboardingScreen.tsx      # 체크리스트 진단
│   │   │   ├── HomeScreen.tsx            # 메인 대시보드
│   │   │   ├── WorkoutScreen.tsx         # 오늘의 운동 + YouTube 영상
│   │   │   ├── VideoPlayerScreen.tsx     # YouTube 임베드 플레이어
│   │   │   └── ReportScreen.tsx          # 진행 리포트
│   │   ├── components/
│   │   │   ├── ChecklistCard.tsx         # 진단 질문 카드
│   │   │   ├── WorkoutCard.tsx           # 운동 추천 카드
│   │   │   ├── YouTubePlayer.tsx         # YouTube 임베드 컴포넌트
│   │   │   └── ProgressBar.tsx           # 진행률 바
│   │   ├── services/
│   │   │   ├── api.ts                    # 백엔드 API 통신
│   │   │   └── youtube.ts               # YouTube 관련 유틸
│   │   ├── stores/
│   │   │   ├── userStore.ts              # 사용자 프로필
│   │   │   ├── checklistStore.ts         # 체크리스트 결과
│   │   │   └── workoutStore.ts           # 운동 기록
│   │   └── types/
│   │       └── index.ts                  # 전체 타입 정의
│   ├── app.json
│   └── package.json
├── backend/                      # FastAPI 서버
│   ├── app/
│   │   ├── main.py                       # FastAPI 앱 엔트리
│   │   ├── api/
│   │   │   ├── checklist.py              # 체크리스트 API
│   │   │   ├── prescription.py           # 운동처방 API
│   │   │   └── youtube_curation.py       # YouTube 큐레이션 API
│   │   ├── services/
│   │   │   ├── fitt_engine.py            # FITT-VP 알고리즘 엔진
│   │   │   ├── youtube_service.py        # YouTube Data API 연동
│   │   │   ├── query_builder.py          # FITT→YouTube 검색쿼리 변환
│   │   │   └── channel_db.py             # 신뢰 채널 DB 관리
│   │   ├── models/
│   │   │   ├── checklist.py              # 체크리스트 데이터 모델
│   │   │   ├── prescription.py           # 운동처방 데이터 모델
│   │   │   └── video_cache.py            # YouTube 캐시 모델
│   │   ├── data/
│   │   │   └── trusted_channels.json     # 신뢰 채널 목록
│   │   └── core/
│   │       ├── config.py                 # 환경변수·설정
│   │       └── cache.py                  # Redis 캐싱 유틸
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── docs/
│   ├── checklist-spec.md
│   └── claude-code-guide.md
└── CLAUDE.md
```

## 핵심 아키텍처: YouTube 큐레이션 흐름

```
[사용자] → [체크리스트 진단] → [FITT-VP 엔진] → [쿼리 빌더] → [YouTube API] → [필터/스코어링] → [영상 추천]
```

### 1단계: FITT-VP 엔진 (fitt_engine.py)
- 체크리스트 6개 영역 점수 → 운동 처방 파라미터 산출
- F(빈도), I(강도), T(시간), T(유형), V(운동량), P(점진성)

### 2단계: 쿼리 빌더 (query_builder.py)
- FITT 결과를 YouTube 검색 쿼리로 변환
- 매핑 규칙:
  - type: "유연성" → "스트레칭", "근력" → "근력운동 홈트"
  - intensity: "저강도" → "초보자", "고강도" → "고강도 인터벌"
  - time: 20분 → "10분" | "15분" | "20분" (±5분 범위)
  - target_area: "목어깨" → "목 스트레칭", "하체" → "하체 운동"
  - context: "홈트레이닝" | "맨몸운동" | "장비 없이"

### 3단계: YouTube Data API v3 호출 (youtube_service.py)
- search.list 엔드포인트 사용
- 필수 파라미터:
  - q: 생성된 검색 쿼리
  - type: "video"
  - videoDuration: "short"(4분 이하) | "medium"(4~20분) | "long"(20분 이상)
  - videoEmbeddable: "true" (임베드 가능한 영상만)
  - relevanceLanguage: "ko" (한국어 우선)
  - regionCode: "KR"
  - order: "relevance" | "viewCount"
  - maxResults: 10
  - safeSearch: "strict"
- 추가 videos.list로 상세 정보 조회 (조회수, 좋아요, 길이 등)

### 4단계: 필터링 & 스코어링 (youtube_service.py)
- 신뢰 채널 DB 우선 (channel_db.py의 화이트리스트)
- 스코어링 공식:
  - 조회수 가중치 (30%)
  - 좋아요/조회수 비율 (20%)
  - 채널 신뢰도 점수 (30%)
  - 영상 길이 매칭도 (20%)
- 최종 3~5개 영상 선정 → 오늘의 운동 플레이리스트

## YouTube API Quota 관리
- 일일 무료 할당량: 10,000 유닛
- search.list: 100 유닛/회 → 하루 최대 100회 검색
- videos.list: 1 유닛/회 → 상세 정보 조회는 거의 무제한
- **캐싱 전략**: 동일 FITT 프로필의 결과를 Redis에 24시간 캐싱
  → 대부분의 사용자가 캐시 히트, 실제 API 호출 대폭 절감

## 신뢰 채널 DB (trusted_channels.json)
```json
{
  "channels": [
    {
      "id": "채널ID",
      "name": "땅끄부부",
      "tags": ["홈트", "유산소", "전연령", "초보자"],
      "trust_score": 95,
      "language": "ko"
    }
  ]
}
```
- 초기 20~30개 채널로 시작, 사용자 피드백으로 확장
- 태그 기반 매칭: FITT 결과의 운동 유형·강도와 채널 태그 비교

## 코딩 컨벤션
- 한국어 주석, 영문 코드
- 컴포넌트명: PascalCase / 파일명: kebab-case (모바일), snake_case (백엔드)
- API 엔드포인트: /api/v1/ 접두사
- 커밋 메시지: 한국어 (예: "feat: YouTube 큐레이션 엔진 구현")
- 모든 API 응답: { "success": bool, "data": any, "message": str }
- YouTube API 키는 절대 클라이언트에 노출하지 않음 (백엔드에서만 호출)

## 환경변수 (.env)
```
YOUTUBE_API_KEY=your_youtube_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///./fitmylife.db
SECRET_KEY=your_secret_key_here
```

## 브랜드 & 디자인
- 앱명: FitMyLife
- 메인 컬러: #2E75B6 / 보조: #4CAF50, #FF9800
- 폰트: Pretendard (한글), Inter (영문)
- 톤앤매너: 친근하면서도 전문적, 해요체

## 중요 참고사항
- YouTube API 키는 백엔드(.env)에서만 관리, 프론트에 노출 금지
- 임베드 불가 영상은 자동 제외 (videoEmbeddable=true)
- 영상 삭제/비공개 대응: 각 운동당 대체 영상 2~3개 확보
- 의료적 진단이 아닌 건강 관리 목적임을 앱 내 고지
- 비개발자도 이해할 수 있도록 코드에 한국어 주석 충분히 작성
