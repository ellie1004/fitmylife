/**
 * 백엔드 API 통신 서비스
 *
 * FastAPI 서버와의 HTTP 통신을 담당합니다.
 * 백엔드 미연결 시 내장 폴백 데이터로 오프라인 동작합니다.
 * 재사용 시 이전에 본 영상을 제외하고 랜덤 로테이션합니다.
 */

import axios from "axios";
import type {
  ApiResponse,
  ChecklistQuestion,
  ChecklistSubmission,
  ChecklistResult,
  WorkoutPlan,
  VideoItem,
} from "../types";

// 개발 서버 주소 (Expo Go에서는 컴퓨터의 로컬 IP 사용)
const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// ── 내장 체크리스트 질문 (백엔드 미연결 시 폴백) ──
const FALLBACK_QUESTIONS: ChecklistQuestion[] = [
  // 신체활동
  { id: "pa_01", category: "physical_activity", text: "일주일에 30분 이상 운동을 몇 번 하시나요?",
    options: ["거의 안 함", "1~2회", "3~4회", "5회 이상", "매일"] },
  { id: "pa_02", category: "physical_activity", text: "하루에 앉아있는 시간이 얼마나 되나요?",
    options: ["10시간 이상", "8~10시간", "6~8시간", "4~6시간", "4시간 미만"] },
  { id: "pa_03", category: "physical_activity", text: "평소 계단 오르기나 걷기를 선호하시나요?",
    options: ["전혀 아님", "가끔", "보통", "자주", "항상"] },
  // 식습관
  { id: "dt_01", category: "diet", text: "하루 세끼를 규칙적으로 드시나요?",
    options: ["거의 못함", "1끼 정도", "2끼 정도", "대체로 규칙적", "매우 규칙적"] },
  { id: "dt_02", category: "diet", text: "채소와 과일을 충분히 섭취하시나요?",
    options: ["거의 안 먹음", "가끔", "보통", "자주", "매일 충분히"] },
  { id: "dt_03", category: "diet", text: "물을 하루에 얼마나 드시나요?",
    options: ["2잔 이하", "3~4잔", "5~6잔", "7~8잔", "8잔 이상"] },
  // 수면
  { id: "sl_01", category: "sleep", text: "평균 수면 시간은 얼마인가요?",
    options: ["5시간 미만", "5~6시간", "6~7시간", "7~8시간", "8시간 이상"] },
  { id: "sl_02", category: "sleep", text: "수면의 질에 만족하시나요?",
    options: ["매우 불만족", "불만족", "보통", "만족", "매우 만족"] },
  { id: "sl_03", category: "sleep", text: "규칙적인 시간에 잠들고 일어나시나요?",
    options: ["전혀", "거의 안 됨", "보통", "대체로", "매우 규칙적"] },
  // 스트레스
  { id: "st_01", category: "stress", text: "최근 스트레스 수준은 어떤가요?",
    options: ["매우 높음", "높음", "보통", "낮음", "매우 낮음"] },
  { id: "st_02", category: "stress", text: "스트레스 해소를 위한 활동을 하고 계신가요?",
    options: ["전혀 없음", "거의 없음", "가끔", "자주", "매우 자주"] },
  { id: "st_03", category: "stress", text: "일과 생활의 균형에 만족하시나요?",
    options: ["매우 불만족", "불만족", "보통", "만족", "매우 만족"] },
  // 건강상태
  { id: "hs_01", category: "health_status", text: "현재 만성 질환이나 통증이 있으신가요?",
    options: ["심각한 문제", "여러 가지", "한두 가지", "경미한 것만", "없음"] },
  { id: "hs_02", category: "health_status", text: "전반적인 체력 상태는 어떻다고 느끼시나요?",
    options: ["매우 낮음", "낮음", "보통", "좋음", "매우 좋음"] },
  { id: "hs_03", category: "health_status", text: "최근 6개월 내 건강검진을 받으셨나요?",
    options: ["3년 이상 전", "1~3년 전", "1년 이내", "6개월 이내", "정기적으로"] },
  // 운동경험
  { id: "ex_01", category: "exercise_experience", text: "규칙적인 운동 경험이 있으신가요?",
    options: ["전혀 없음", "과거에 잠깐", "간헐적", "꾸준히 1년 이상", "전문 수준"] },
  { id: "ex_02", category: "exercise_experience", text: "어떤 운동을 해보셨나요? (가장 익숙한 것)",
    options: ["없음", "걷기 정도", "요가/스트레칭", "달리기/수영 등", "웨이트/구기 등"] },
  { id: "ex_03", category: "exercise_experience", text: "운동 기구나 시설을 이용할 수 있나요?",
    options: ["전혀 없음", "매트 정도", "덤벨·밴드 등", "홈짐 수준", "헬스장 이용"] },
];

// ── 확장된 영상 풀 (강도별, 매번 랜덤 3개 선정) ──
const VIDEO_POOL: Record<string, VideoItem[]> = {
  low: [
    { video_id: "50WCSpZtdmA", title: "[ENG] 심으뜸 매일 아침 10분 스트레칭ㅣ2023 리뉴얼", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/50WCSpZtdmA/hqdefault.jpg", duration_seconds: 625, view_count: 5750929, score: 92 },
    { video_id: "yyjOhsNEqtE", title: "[ENG] 운동 전 최고의 스트레칭! 10분만 따라해도 운동효과 대박!", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/yyjOhsNEqtE/hqdefault.jpg", duration_seconds: 660, view_count: 8253317, score: 88 },
    { video_id: "8VtkpMGw0hw", title: "자기전 숙면을 도와주는 10분 스트레칭", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/8VtkpMGw0hw/hqdefault.jpg", duration_seconds: 571, view_count: 2744673, score: 85 },
    { video_id: "3gS6sTOBBLk", title: "매일 10분! 전신 스트레칭 루틴", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/3gS6sTOBBLk/hqdefault.jpg", duration_seconds: 630, view_count: 3200000, score: 87 },
    { video_id: "Yzm3IcGWpn4", title: "아침에 하면 좋은 10분 요가 스트레칭", channel_title: "요가소풍", thumbnail_url: "https://i.ytimg.com/vi/Yzm3IcGWpn4/hqdefault.jpg", duration_seconds: 610, view_count: 1800000, score: 83 },
    { video_id: "g_tea8ZNssA", title: "목 어깨 통증 해소 스트레칭 10분", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/g_tea8ZNssA/hqdefault.jpg", duration_seconds: 595, view_count: 9500000, score: 90 },
    { video_id: "CLakGauILGc", title: "허리 통증 없애는 스트레칭 15분", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/CLakGauILGc/hqdefault.jpg", duration_seconds: 900, view_count: 4100000, score: 86 },
    { video_id: "4pKly2JojMw", title: "하루 10분 전신 스트레칭으로 유연성 기르기", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/4pKly2JojMw/hqdefault.jpg", duration_seconds: 640, view_count: 6700000, score: 89 },
    { video_id: "2L2lnxIcNmo", title: "초보자 요가 15분 - 온몸이 개운해지는 루틴", channel_title: "요가소풍", thumbnail_url: "https://i.ytimg.com/vi/2L2lnxIcNmo/hqdefault.jpg", duration_seconds: 920, view_count: 2300000, score: 84 },
  ],
  moderate: [
    { video_id: "swRNeYBMPaE", title: "이 운동 진짜 살 잘 빠짐!! 20분 전신 유산소 홈트", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/swRNeYBMPaE/hqdefault.jpg", duration_seconds: 1230, view_count: 42000000, score: 95 },
    { video_id: "gMaB-fG4u4g", title: "층간소음 없는 유산소 20분! 이거 하나면 전신 다이어트 끝!", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/gMaB-fG4u4g/hqdefault.jpg", duration_seconds: 1180, view_count: 28000000, score: 91 },
    { video_id: "ZJa0HRRlnwo", title: "20분 전신 유산소 운동 (초중급)", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/ZJa0HRRlnwo/hqdefault.jpg", duration_seconds: 1250, view_count: 15000000, score: 89 },
    { video_id: "7TLk7pscICk", title: "살 빠지는 댄스 다이어트 30분", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/7TLk7pscICk/hqdefault.jpg", duration_seconds: 1800, view_count: 35000000, score: 93 },
    { video_id: "QMbRLqYiKMc", title: "층간소음 없이 체지방 불태우는 15분 홈트", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/QMbRLqYiKMc/hqdefault.jpg", duration_seconds: 920, view_count: 8500000, score: 87 },
    { video_id: "MYJKxFbTPKE", title: "하루 20분 전신 칼로리 폭탄 운동", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/MYJKxFbTPKE/hqdefault.jpg", duration_seconds: 1200, view_count: 12000000, score: 90 },
    { video_id: "YFsGah6LhEo", title: "10분 서서하는 복부운동 (층간소음 NO)", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/YFsGah6LhEo/hqdefault.jpg", duration_seconds: 600, view_count: 19000000, score: 88 },
    { video_id: "vNj5MRam6tU", title: "20분 유산소+근력 전신 홈트레이닝", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/vNj5MRam6tU/hqdefault.jpg", duration_seconds: 1220, view_count: 5600000, score: 86 },
    { video_id: "JfxfGaROkJU", title: "하체 근력 + 유산소 20분 루틴", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/JfxfGaROkJU/hqdefault.jpg", duration_seconds: 1250, view_count: 7800000, score: 85 },
  ],
  high: [
    { video_id: "cZnsLGIH0hw", title: "고강도 인터벌 30분 HIIT (전신 근력+유산소)", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/cZnsLGIH0hw/hqdefault.jpg", duration_seconds: 1800, view_count: 11000000, score: 94 },
    { video_id: "swRNeYBMPaE", title: "이 운동 진짜 살 잘 빠짐!! 20분 전신 유산소 홈트", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/swRNeYBMPaE/hqdefault.jpg", duration_seconds: 1230, view_count: 42000000, score: 95 },
    { video_id: "7TLk7pscICk", title: "살 빠지는 댄스 다이어트 30분", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/7TLk7pscICk/hqdefault.jpg", duration_seconds: 1800, view_count: 35000000, score: 93 },
    { video_id: "gMaB-fG4u4g", title: "층간소음 없는 유산소 20분! 이거 하나면 전신 다이어트 끝!", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/gMaB-fG4u4g/hqdefault.jpg", duration_seconds: 1180, view_count: 28000000, score: 91 },
    { video_id: "pHfCrHDFBAQ", title: "30분 전신 근력운동 (덤벨 없이 맨몸)", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/pHfCrHDFBAQ/hqdefault.jpg", duration_seconds: 1850, view_count: 6200000, score: 88 },
    { video_id: "MYJKxFbTPKE", title: "하루 20분 전신 칼로리 폭탄 운동", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/MYJKxFbTPKE/hqdefault.jpg", duration_seconds: 1200, view_count: 12000000, score: 90 },
    { video_id: "wbhgEFkUYSg", title: "전신 타바타 20분 - 체지방 녹이기", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/wbhgEFkUYSg/hqdefault.jpg", duration_seconds: 1200, view_count: 9800000, score: 89 },
    { video_id: "cbKkB3POqaY", title: "HIIT 15분 고강도 전신 인터벌", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/cbKkB3POqaY/hqdefault.jpg", duration_seconds: 900, view_count: 7500000, score: 87 },
    { video_id: "vNj5MRam6tU", title: "20분 유산소+근력 전신 홈트레이닝", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/vNj5MRam6tU/hqdefault.jpg", duration_seconds: 1220, view_count: 5600000, score: 86 },
  ],
  // 시니어 전용 영상 풀
  senior: [
    { video_id: "F4GnKSJLft8", title: "어르신 건강체조 15분 - 앉아서 하는 전신 운동", channel_title: "국민건강보험", thumbnail_url: "https://i.ytimg.com/vi/F4GnKSJLft8/hqdefault.jpg", duration_seconds: 900, view_count: 3200000, score: 92 },
    { video_id: "qUlxlW2V2Vg", title: "시니어 스트레칭 - 관절 부드럽게 10분", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/qUlxlW2V2Vg/hqdefault.jpg", duration_seconds: 620, view_count: 1500000, score: 88 },
    { video_id: "Z9p4dMFz7Bk", title: "어르신 낙상예방 운동 (의자 활용)", channel_title: "국민건강보험", thumbnail_url: "https://i.ytimg.com/vi/Z9p4dMFz7Bk/hqdefault.jpg", duration_seconds: 720, view_count: 980000, score: 90 },
    { video_id: "YeaGUfZM5pw", title: "50대 60대 관절 스트레칭 15분", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/YeaGUfZM5pw/hqdefault.jpg", duration_seconds: 910, view_count: 2100000, score: 87 },
    { video_id: "u7lxPaai0XA", title: "시니어 밸런스 운동 - 균형감각 키우기", channel_title: "국민건강보험", thumbnail_url: "https://i.ytimg.com/vi/u7lxPaai0XA/hqdefault.jpg", duration_seconds: 600, view_count: 750000, score: 85 },
    { video_id: "JT3JRHvocCs", title: "어르신 걷기 운동법 + 준비 스트레칭", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/JT3JRHvocCs/hqdefault.jpg", duration_seconds: 840, view_count: 1200000, score: 86 },
    { video_id: "RfksNLO1MCo", title: "60대 70대 맞춤 건강 체조 20분", channel_title: "국민건강보험", thumbnail_url: "https://i.ytimg.com/vi/RfksNLO1MCo/hqdefault.jpg", duration_seconds: 1200, view_count: 1800000, score: 89 },
    { video_id: "G20DNy0ogeo", title: "시니어 요가 - 의자에 앉아서 하는 15분", channel_title: "요가소풍", thumbnail_url: "https://i.ytimg.com/vi/G20DNy0ogeo/hqdefault.jpg", duration_seconds: 920, view_count: 650000, score: 84 },
    { video_id: "LJSiGQDH2mY", title: "50+ 허리 강화 운동 (허리디스크 예방)", channel_title: "피지컬갤러리", thumbnail_url: "https://i.ytimg.com/vi/LJSiGQDH2mY/hqdefault.jpg", duration_seconds: 780, view_count: 2800000, score: 91 },
  ],
};

// ── 배열 셔플 유틸 (Fisher-Yates) ──
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 이전에 본 영상을 제외하고 랜덤으로 3개 선정
 * 모든 영상을 봤으면 전체 풀에서 다시 랜덤 선정 (리셋)
 */
function pickRandomVideos(
  pool: VideoItem[],
  count: number,
  watchedIds: string[]
): VideoItem[] {
  // 안 본 영상 필터링
  let unseen = pool.filter((v) => !watchedIds.includes(v.video_id));

  // 모두 봤으면 풀 전체에서 다시 선정
  if (unseen.length < count) {
    unseen = pool;
  }

  return shuffle(unseen).slice(0, count);
}

// ── localStorage 헬퍼 (웹 + 앱 호환) ──
function getWatchedIds(): string[] {
  try {
    const stored = localStorage.getItem("fitmylife_watched");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWatchedIds(ids: string[]) {
  try {
    localStorage.setItem("fitmylife_watched", JSON.stringify(ids));
  } catch {
    // 로컬스토리지 불가 환경 무시
  }
}

// ── 로컬 체크리스트 분석 (백엔드 미연결 시 폴백) ──
function analyzeChecklistLocally(
  submission: ChecklistSubmission
): ChecklistResult {
  const categoryScores: Record<string, number[]> = {};

  for (const answer of submission.answers) {
    const q = FALLBACK_QUESTIONS.find((q) => q.id === answer.question_id);
    if (q) {
      if (!categoryScores[q.category]) categoryScores[q.category] = [];
      categoryScores[q.category].push(answer.value);
    }
  }

  const avg = (cat: string): number => {
    const scores = categoryScores[cat] || [3];
    return Math.round(((scores.reduce((a, b) => a + b, 0) / scores.length - 1) / 4) * 1000) / 10;
  };

  const physical_activity = avg("physical_activity");
  const diet = avg("diet");
  const sleep = avg("sleep");
  const stress = avg("stress");
  const health_status = avg("health_status");
  const exercise_experience = avg("exercise_experience");

  const overall_score = Math.round(
    (physical_activity * 0.25 +
      diet * 0.1 +
      sleep * 0.15 +
      stress * 0.1 +
      health_status * 0.15 +
      exercise_experience * 0.25) * 10
  ) / 10;

  return {
    physical_activity,
    diet,
    sleep,
    stress,
    health_status,
    exercise_experience,
    overall_score,
  };
}

// ── 시니어 여부 판별 (60세 이상) ──
function isSenior(age: number): boolean {
  return age >= 60;
}

// ── 로컬 운동처방 생성 (백엔드 미연결 시 폴백) ──
function generatePrescriptionLocally(
  submission: ChecklistSubmission
): WorkoutPlan {
  const result = analyzeChecklistLocally(submission);
  const score = result.overall_score;
  const senior = isSenior(submission.user_age);

  let intensity: "low" | "moderate" | "high";
  let frequency: number;
  let time_minutes: number;
  let exercise_type: string;
  let message: string;

  if (senior) {
    // 시니어는 저강도 중심, 안전 우선
    intensity = "low";
    frequency = score < 40 ? 2 : 3;
    time_minutes = score < 40 ? 10 : 15;
    exercise_type = "flexibility";
    message = "건강한 하루를 위해 가볍게 움직여 볼까요? 🌿";
  } else if (score < 35) {
    intensity = "low";
    frequency = 3;
    time_minutes = 15;
    exercise_type = "flexibility";
    message = "무리하지 않는 선에서 천천히 시작해요! 🌱";
  } else if (score < 65) {
    intensity = "moderate";
    frequency = 4;
    time_minutes = 25;
    exercise_type = "cardio";
    message = "좋은 기초 체력이에요! 조금 더 도전해볼까요? 💪";
  } else {
    intensity = "high";
    frequency = 5;
    time_minutes = 35;
    exercise_type = "strength";
    message = "훌륭해요! 더 강하게 밀어붙여 봅시다! 🔥";
  }

  const targetArea =
    result.exercise_experience < 30
      ? "전신"
      : result.physical_activity < 40
      ? "하체·코어"
      : "상체·전신";

  // 이전에 본 영상 제외하고 랜덤 선정
  const watchedIds = getWatchedIds();
  const videoPoolKey = senior ? "senior" : intensity;
  const selectedVideos = pickRandomVideos(
    VIDEO_POOL[videoPoolKey],
    3,
    watchedIds
  );

  // 선정된 영상 ID를 watched 목록에 추가
  const newWatchedIds = [
    ...watchedIds,
    ...selectedVideos.map((v) => v.video_id),
  ];
  saveWatchedIds(newWatchedIds);

  const typeLabel: Record<string, string> = {
    flexibility: "초보자 홈트 스트레칭",
    cardio: "전신 유산소 홈트",
    strength: "고강도 근력 홈트",
  };

  return {
    fitt: {
      frequency,
      intensity,
      time_minutes,
      exercise_type,
      volume: intensity === "low" ? "light" : intensity === "moderate" ? "moderate" : "heavy",
      progression: senior
        ? "2주마다 운동 시간 2~3분 증가"
        : intensity === "low"
        ? "2주마다 운동 시간 5분 증가"
        : intensity === "moderate"
        ? "2주마다 강도 또는 시간 10% 증가"
        : "1주마다 세트 수 또는 강도 증가",
    },
    videos: selectedVideos,
    search_query: senior
      ? `시니어 건강체조 ${time_minutes}분`
      : `${typeLabel[exercise_type] || "홈트"} ${time_minutes}분`,
    target_area: targetArea,
    message,
  };
}

// ── API 함수들 ──

/** 체크리스트 질문 목록 조회 (백엔드 실패 시 내장 데이터 반환) */
export async function fetchQuestions(): Promise<ChecklistQuestion[]> {
  try {
    const { data } = await api.get<ApiResponse<ChecklistQuestion[]>>(
      "/api/v1/checklist/questions"
    );
    return data.data;
  } catch {
    return FALLBACK_QUESTIONS;
  }
}

/** 체크리스트 제출 및 분석 결과 반환 */
export async function submitChecklist(
  submission: ChecklistSubmission
): Promise<ChecklistResult> {
  try {
    const { data } = await api.post<ApiResponse<ChecklistResult>>(
      "/api/v1/checklist/submit",
      submission
    );
    return data.data;
  } catch {
    return analyzeChecklistLocally(submission);
  }
}

/** 맞춤 운동처방 + YouTube 영상 생성 (백엔드 실패 시 로컬 처방) */
export async function generatePrescription(
  submission: ChecklistSubmission
): Promise<WorkoutPlan> {
  try {
    const { data } = await api.post<ApiResponse<WorkoutPlan>>(
      "/api/v1/prescription/generate",
      submission
    );
    return data.data;
  } catch {
    return generatePrescriptionLocally(submission);
  }
}

/** YouTube 영상 직접 검색 */
export async function searchVideos(
  query: string,
  targetMinutes: number = 15
): Promise<VideoItem[]> {
  const { data } = await api.get<ApiResponse<VideoItem[]>>(
    "/api/v1/youtube/search",
    { params: { q: query, target_minutes: targetMinutes, max_results: 5 } }
  );
  return data.data;
}
