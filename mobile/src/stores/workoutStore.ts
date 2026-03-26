/**
 * 운동 플랜 상태 관리 (Zustand + localStorage 영속화)
 *
 * 운동처방 결과와 추천 영상 목록을 전역으로 관리합니다.
 * 재방문 시 이전 처방을 유지하여 바로 홈 화면으로 진입합니다.
 */

import { create } from "zustand";
import type { WorkoutPlan, ChecklistResult } from "../types";

const PLAN_KEY = "fitmylife_plan";
const RESULT_KEY = "fitmylife_checklist_result";

function loadPlan(): WorkoutPlan | null {
  try {
    const stored = localStorage.getItem(PLAN_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function savePlan(plan: WorkoutPlan | null) {
  try {
    if (plan) localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    else localStorage.removeItem(PLAN_KEY);
  } catch {}
}

function loadResult(): ChecklistResult | null {
  try {
    const stored = localStorage.getItem(RESULT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveResult(result: ChecklistResult | null) {
  try {
    if (result) localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    else localStorage.removeItem(RESULT_KEY);
  } catch {}
}

interface WorkoutState {
  checklistResult: ChecklistResult | null;
  setChecklistResult: (result: ChecklistResult) => void;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan) => void;
  currentVideoId: string | null;
  setCurrentVideoId: (id: string | null) => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  checklistResult: loadResult(),
  setChecklistResult: (result) => {
    saveResult(result);
    set({ checklistResult: result });
  },

  workoutPlan: loadPlan(),
  setWorkoutPlan: (plan) => {
    savePlan(plan);
    set({ workoutPlan: plan });
  },

  currentVideoId: null,
  setCurrentVideoId: (id) => set({ currentVideoId: id }),

  reset: () => {
    savePlan(null);
    saveResult(null);
    set({ checklistResult: null, workoutPlan: null, currentVideoId: null });
  },
}));
