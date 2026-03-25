/**
 * 백엔드 API 통신 서비스
 *
 * FastAPI 서버와의 HTTP 통신을 담당합니다.
 * 개발 환경에서는 localhost, 프로덕션에서는 실제 서버 URL을 사용합니다.
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
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── 체크리스트 API ──

/** 체크리스트 질문 목록 조회 */
export async function fetchQuestions(): Promise<ChecklistQuestion[]> {
  const { data } = await api.get<ApiResponse<ChecklistQuestion[]>>(
    "/api/v1/checklist/questions"
  );
  return data.data;
}

/** 체크리스트 제출 및 분석 결과 반환 */
export async function submitChecklist(
  submission: ChecklistSubmission
): Promise<ChecklistResult> {
  const { data } = await api.post<ApiResponse<ChecklistResult>>(
    "/api/v1/checklist/submit",
    submission
  );
  return data.data;
}

// ── 운동처방 API ──

/** 맞춤 운동처방 + YouTube 영상 생성 */
export async function generatePrescription(
  submission: ChecklistSubmission
): Promise<WorkoutPlan> {
  const { data } = await api.post<ApiResponse<WorkoutPlan>>(
    "/api/v1/prescription/generate",
    submission
  );
  return data.data;
}

// ── YouTube 검색 API ──

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
