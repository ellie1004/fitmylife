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
  user_gender: "male" | "female" | "other";
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
  gender: "male" | "female" | "other";
  height?: number;
  weight?: number;
  nickname?: string;
}
