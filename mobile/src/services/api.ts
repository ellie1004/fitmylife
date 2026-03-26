/**
 * 백엔드 API 통신 서비스
 *
 * FastAPI 서버와의 HTTP 통신을 담당합니다.
 * 백엔드 미연결 시 내장 폴백 데이터로 오프라인 동작합니다.
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

// ── 로컬 운동처방 생성 (백엔드 미연결 시 폴백) ──
function generatePrescriptionLocally(
  submission: ChecklistSubmission
): WorkoutPlan {
  const result = analyzeChecklistLocally(submission);
  const score = result.overall_score;

  // 점수에 따른 FITT 결정
  let intensity: "low" | "moderate" | "high";
  let frequency: number;
  let time_minutes: number;
  let exercise_type: string;
  let message: string;

  if (score < 35) {
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

  // 운동경험 점수로 타겟 영역 결정
  const targetArea =
    result.exercise_experience < 30
      ? "전신"
      : result.physical_activity < 40
      ? "하체·코어"
      : "상체·전신";

  // 강도별 기본 추천 영상
  const videoSets: Record<string, WorkoutPlan["videos"]> = {
    low: [
      { video_id: "50WCSpZtdmA", title: "[ENG] 심으뜸 매일 아침 10분 스트레칭ㅣ2023 리뉴얼", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/50WCSpZtdmA/hqdefault.jpg", duration_seconds: 625, view_count: 5750929, score: 92 },
      { video_id: "yyjOhsNEqtE", title: "[ENG] 운동 전 최고의 스트레칭! 10분만 따라해도 운동효과 대박!", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/yyjOhsNEqtE/hqdefault.jpg", duration_seconds: 660, view_count: 8253317, score: 88 },
      { video_id: "8VtkpMGw0hw", title: "자기전 숙면을 도와주는 10분 스트레칭", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/8VtkpMGw0hw/hqdefault.jpg", duration_seconds: 571, view_count: 2744673, score: 85 },
    ],
    moderate: [
      { video_id: "swRNeYBMPaE", title: "이 운동 진짜 살 잘 빠짐!! 20분 전신 유산소 홈트", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/swRNeYBMPaE/hqdefault.jpg", duration_seconds: 1230, view_count: 42000000, score: 95 },
      { video_id: "gMaB-fG4u4g", title: "층간소음 없는 유산소 20분! 이거 하나면 전신 다이어트 끝!", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/gMaB-fG4u4g/hqdefault.jpg", duration_seconds: 1180, view_count: 28000000, score: 91 },
      { video_id: "50WCSpZtdmA", title: "[ENG] 심으뜸 매일 아침 10분 스트레칭ㅣ2023 리뉴얼", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/50WCSpZtdmA/hqdefault.jpg", duration_seconds: 625, view_count: 5750929, score: 82 },
    ],
    high: [
      { video_id: "swRNeYBMPaE", title: "이 운동 진짜 살 잘 빠짐!! 20분 전신 유산소 홈트", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/swRNeYBMPaE/hqdefault.jpg", duration_seconds: 1230, view_count: 42000000, score: 95 },
      { video_id: "gMaB-fG4u4g", title: "층간소음 없는 유산소 20분! 이거 하나면 전신 다이어트 끝!", channel_title: "땅끄부부 THANKYOU BUBU", thumbnail_url: "https://i.ytimg.com/vi/gMaB-fG4u4g/hqdefault.jpg", duration_seconds: 1180, view_count: 28000000, score: 91 },
      { video_id: "yyjOhsNEqtE", title: "[ENG] 운동 전 최고의 스트레칭! 10분만 따라해도 운동효과 대박!", channel_title: "힙으뜸", thumbnail_url: "https://i.ytimg.com/vi/yyjOhsNEqtE/hqdefault.jpg", duration_seconds: 660, view_count: 8253317, score: 86 },
    ],
  };

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
      progression:
        intensity === "low"
          ? "2주마다 운동 시간 5분 증가"
          : intensity === "moderate"
          ? "2주마다 강도 또는 시간 10% 증가"
          : "1주마다 세트 수 또는 강도 증가",
    },
    videos: videoSets[intensity],
    search_query: `${typeLabel[exercise_type] || "홈트"} ${time_minutes}분`,
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
