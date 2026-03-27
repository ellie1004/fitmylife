/**
 * FitMyLife 전체 타입 정의
 */

// ── 체크리스트 관련 ──

export interface ChecklistQuestion {
  id: string;
  category: string;
  text: string;
  options: string[];
}

export interface ChecklistAnswer {
  question_id: string;
  value: number; // 1~5
}

export interface ChecklistSubmission {
  answers: ChecklistAnswer[];
  user_age: number;
  user_gender: "male" | "female";
  user_height?: number;
  user_weight?: number;
}

export interface ChecklistResult {
  physical_activity: number;
  diet: number;
  sleep: number;
  stress: number;
  health_status: number;
  exercise_experience: number;
  overall_score: number;
}

// ── 운동처방 관련 ──

export interface FITTResult {
  frequency: number;
  intensity: "low" | "moderate" | "high";
  time_minutes: number;
  exercise_type: string;
  volume: string;
  progression: string;
}

export interface VideoItem {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  duration_seconds: number;
  view_count: number;
  score: number;
}

export interface WorkoutPlan {
  fitt: FITTResult;
  videos: VideoItem[];
  search_query: string;
  target_area: string;
  message: string;
}

// ── API 응답 래퍼 ──

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// ── 사용자 프로필 ──

export interface UserProfile {
  age: number;
  gender: "male" | "female";
  height?: number;
  weight?: number;
  nickname?: string;
  targetAreas?: TargetBodyArea[];
}

// ── 고민 부위 ──

export type TargetBodyArea =
  | "jawline"    // 턱선
  | "arms"       // 팔뚝
  | "belly"      // 복부
  | "back"       // 등
  | "shoulders"  // 어깨
  | "thighs"     // 허벅지
  | "hips"       // 엉덩이
  | "calves";    // 종아리

// ── 운동 목표 트래커 ──

export interface GoalTracker {
  // 목표 시작일 (ISO string)
  startDate: string;
  // 운동 완료한 날짜 목록 (ISO date strings, 중복 없음)
  completedDates: string[];
  // 현재 활성 목표 (3일/7일/21일/100일)
  activeGoal: 3 | 7 | 21 | 100;
  // 이전에 본 영상 ID 목록 (랜덤 로테이션용)
  watchedVideoIds: string[];
}
