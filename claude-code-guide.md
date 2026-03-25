# FitMyLife - Claude Code 시작 가이드 (YouTube API 연동 버전)

## 🚀 지금 바로 시작하기

### 사전 준비 (1회만)

1. **YouTube Data API 키 발급** (무료, 5분 소요)
   - https://console.cloud.google.com 접속
   - 새 프로젝트 생성 → "YouTube Data API v3" 활성화
   - 사용자 인증 정보 → API 키 생성
   - 이 키를 `.env` 파일에 넣으면 됨

2. **프로젝트 폴더 준비**
   ```bash
   mkdir fitmylife && cd fitmylife
   # CLAUDE.md, backend/app/data/trusted_channels.json을 여기에 넣기
   ```

3. **Claude Code 실행**
   ```bash
   claude
   ```

---

## 📋 Step-by-Step 프롬프트

### Step 1: 프로젝트 초기화 + 백엔드 셋업

```
CLAUDE.md를 읽고 프로젝트 구조를 파악해줘.

다음을 순서대로 진행해줘:

1. backend/ 폴더에 FastAPI 프로젝트 초기화
   - requirements.txt: fastapi, uvicorn, httpx, redis, pydantic, python-dotenv
   - .env.example 파일 생성 (YOUTUBE_API_KEY, REDIS_URL 등)
   - app/main.py: FastAPI 앱 + CORS 설정 + 라우터 등록
   - app/core/config.py: 환경변수 로드 (pydantic Settings)

2. YouTube Data API 연동 서비스 구현 (app/services/youtube_service.py)
   - httpx로 YouTube search.list API 호출
   - 필수 파라미터: q, type=video, videoEmbeddable=true, 
     relevanceLanguage=ko, regionCode=KR, safeSearch=strict
   - videoDuration 필터 지원 (short/medium/long)
   - channelId 필터로 신뢰 채널 우선 검색
   - videos.list로 상세 정보(조회수, 좋아요, 길이) 조회
   - 결과를 VideoResult Pydantic 모델로 파싱

3. 신뢰 채널 DB 로더 (app/services/channel_db.py)
   - trusted_channels.json 로드
   - 태그 기반 채널 필터링 함수
   - 채널 trust_score 조회 함수

각 파일에 한국어 주석을 충분히 달아줘.
각 단계마다 커밋해줘.
```

### Step 2: FITT-VP 엔진 + 쿼리 빌더

```
다음 두 개의 핵심 서비스를 구현해줘:

1. FITT-VP 운동처방 엔진 (app/services/fitt_engine.py)
   
   입력: 체크리스트 6개 영역 점수 (각 1.0~5.0)
   {
     "physical_activity": 2.0,
     "sleep": 3.5,
     "diet": 2.5,
     "stress": 2.0,
     "work_pattern": 1.5,
     "health_condition": 4.0
   }
   
   출력: FITT-VP 파라미터
   {
     "frequency": 3,           # 주 3회
     "intensity": "low",       # 저강도
     "time_minutes": 20,       # 20분
     "types": ["flexibility", "cardio"],  # 유형
     "target_areas": ["neck_shoulder", "core"],  # 부위
     "weekly_met_minutes": 300,  # 주간 MET-min
     "progression_weeks": 4,    # 점진성 주기
     "reasoning": "좌식 시간이 길고 스트레스가 높아..."  # 처방 근거
   }

   - 각 영역 점수의 가중치 반영
   - 기저질환 점수 낮으면 강도 자동 하향
   - 수면 부족이면 저녁 운동 제한 표시
   
2. 쿼리 빌더 (app/services/query_builder.py)
   
   FITT 결과 → YouTube 검색 쿼리 자동 생성
   
   매핑 규칙:
   - types: flexibility→"스트레칭", strength→"근력운동", 
     cardio→"유산소", balance→"밸런스", hiit→"HIIT 타바타"
   - intensity: low→"초보자", moderate→"중급", high→"고강도"  
   - time: ±5분 범위의 키워드 ("10분", "15분", "20분")
   - target_areas: neck_shoulder→"목 어깨", lower_body→"하체", 
     core→"코어 복근", full_body→"전신"
   - context: 항상 "홈트레이닝" 또는 "집에서" 추가
   
   - 하루치 운동에 대해 2~3개 검색 쿼리 생성
   - 각 쿼리에 대해 YouTube videoDuration 필터값도 함께 반환
   
   예시 출력:
   [
     {
       "query": "초보자 목어깨 스트레칭 10분 홈트레이닝",
       "duration_filter": "short",
       "exercise_type": "flexibility",
       "target_area": "neck_shoulder"
     },
     {
       "query": "초보자 코어 운동 15분 맨몸",
       "duration_filter": "medium", 
       "exercise_type": "strength",
       "target_area": "core"
     }
   ]

각 함수에 docstring과 한국어 주석 달아줘.
단위 테스트도 함께 작성해줘.
커밋해줘.
```

### Step 3: 큐레이션 API 엔드포인트 통합

```
Step 1과 Step 2에서 만든 서비스를 연결하는 API 엔드포인트를 만들어줘.

1. POST /api/v1/prescription (app/api/prescription.py)
   - 입력: 체크리스트 6개 영역 점수
   - 처리: fitt_engine → FITT-VP 결과 산출
   - 출력: 주간 운동 계획 + FITT 파라미터 + 처방 근거

2. POST /api/v1/curate (app/api/youtube_curation.py)  
   - 입력: FITT-VP 결과 (또는 체크리스트 점수를 받아 내부에서 처리)
   - 처리 흐름:
     a) fitt_engine으로 처방 산출
     b) query_builder로 검색 쿼리 생성
     c) 각 쿼리에 대해 youtube_service로 검색
     d) 신뢰 채널 우선 정렬 + 스코어링
     e) 각 운동당 최적 영상 1개 + 대체 영상 2개 선정
   - 출력:
   {
     "success": true,
     "data": {
       "daily_workout": {
         "date": "2026-03-25",
         "total_duration": 25,
         "exercises": [
           {
             "order": 1,
             "name": "목·어깨 스트레칭",
             "type": "flexibility",
             "duration_minutes": 10,
             "video": {
               "video_id": "xxx",
               "title": "...",
               "channel": "땅끄부부",
               "thumbnail": "...",
               "duration": "PT10M30S",
               "view_count": 1500000
             },
             "alternatives": [...]
           }
         ]
       },
       "fitt_parameters": {...},
       "reasoning": "..."
     }
   }

3. 캐싱 로직 추가 (app/core/cache.py)
   - FITT 프로필 해시 기반 캐시 키 생성
   - Redis에 24시간 TTL로 캐싱
   - Redis 미연결 시 인메모리 dict 폴백

4. app/main.py에 라우터 등록

커밋해줘. 그리고 uvicorn으로 서버 실행 테스트해줘.
```

### Step 4: React Native 앱 + YouTube 플레이어

```
이제 모바일 앱을 만들어줘.

1. Expo + TypeScript 프로젝트 초기화
   - expo init으로 blank-typescript 템플릿
   - 필요 패키지: react-native-youtube-iframe, 
     @react-navigation/native, @react-navigation/bottom-tabs,
     zustand, nativewind, axios

2. 네비게이션 구조
   - BottomTab: 홈 | 운동 | 리포트
   - Stack: 온보딩(첫 실행 시) → 메인 탭

3. 온보딩 체크리스트 화면 (OnboardingScreen.tsx)
   - 6개 영역을 스와이프 카드로 구성
   - 질문 데이터는 checklistStore에서 관리
   - 완료 시 백엔드 /api/v1/curate 호출

4. 오늘의 운동 화면 (WorkoutScreen.tsx)
   - /api/v1/curate 결과의 exercises 목록 표시
   - 각 운동 카드: 썸네일 + 제목 + 채널명 + 시간
   - 카드 탭 → VideoPlayerScreen으로 이동

5. YouTube 플레이어 (VideoPlayerScreen.tsx)
   - react-native-youtube-iframe으로 영상 재생
   - 영상 완료 시 "운동 완료" 버튼 활성화
   - 완료 기록 저장

메인 컬러 #2E75B6, Pretendard 폰트 적용해줘.
각 단계마다 커밋해줘.
```

---

## 💡 핵심 팁

### YouTube API 키 발급 방법 (비개발자용)
1. https://console.cloud.google.com 로그인
2. 상단 "프로젝트 선택" → "새 프로젝트" → 이름 입력 → 만들기
3. 왼쪽 메뉴 "API 및 서비스" → "라이브러리"
4. "YouTube Data API v3" 검색 → "사용" 클릭
5. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키"
6. 생성된 키 복사 → .env 파일의 YOUTUBE_API_KEY에 붙여넣기

### 테스트 방법
```bash
# 백엔드 실행
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# API 테스트 (다른 터미널)
curl -X POST http://localhost:8000/api/v1/curate \
  -H "Content-Type: application/json" \
  -d '{
    "physical_activity": 2.0,
    "sleep": 3.5,
    "diet": 2.5,
    "stress": 2.0,
    "work_pattern": 1.5,
    "health_condition": 4.0
  }'
```

### Redis 없이 테스트하기
Redis가 설치되지 않아도 인메모리 캐시 폴백이 동작하므로
로컬 개발 시에는 Redis 없이 테스트할 수 있습니다.
