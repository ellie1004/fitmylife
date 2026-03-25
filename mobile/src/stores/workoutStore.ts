/**
 * 운동 플랜 상태 관리 (Zustand)
 *
 * 운동처방 결과와 추천 영상 목록을 전역으로 관리합니다.
 */

import { create } from "zustand";
import type { WorkoutPlan, ChecklistResult } from "../types";

interface WorkoutState {
  // 체크리스트 분석 결과
  checklistResult: ChecklistResult | null;
  setChecklistResult: (result: ChecklistResult) => void;

  // 운동 플랜 (FITT + 영상)
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan) => void;

  // 현재 재생 중인 영상 ID
  currentVideoId: string | null;
  setCurrentVideoId: (id: string | null) => void;

  // 상태 초기화
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  checklistResult: null,
  setChecklistResult: (result) => set({ checklistResult: result }),

  workoutPlan: null,
  setWorkoutPlan: (plan) => set({ workoutPlan: plan }),

  currentVideoId: null,
  setCurrentVideoId: (id) => set({ currentVideoId: id }),

  reset: () =>
    set({
      checklistResult: null,
      workoutPlan: null,
      currentVideoId: null,
    }),
}));
