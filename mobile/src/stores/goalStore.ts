/**
 * 운동 목표 트래커 상태 관리 (Zustand + localStorage 영속화)
 *
 * 7일/21일/100일 목표를 설정하고 운동 완료 날짜를 기록합니다.
 * 브라우저 localStorage에 자동 저장되어 재방문 시에도 유지됩니다.
 */

import { create } from "zustand";
import type { GoalTracker } from "../types";

// localStorage 키
const STORAGE_KEY = "fitmylife_goal";

// localStorage에서 초기값 로드
function loadGoal(): GoalTracker {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // 무시
  }
  return {
    startDate: new Date().toISOString().split("T")[0],
    completedDates: [],
    activeGoal: 7,
    watchedVideoIds: [],
  };
}

// localStorage에 저장
function saveGoal(goal: GoalTracker) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  } catch {
    // 무시
  }
}

interface GoalState extends GoalTracker {
  // 목표 변경
  setGoal: (goal: 7 | 21 | 100) => void;
  // 오늘 운동 완료 체크
  markTodayComplete: () => void;
  // 오늘 운동 완료 여부
  isTodayComplete: () => boolean;
  // 완료 일수
  completedCount: () => number;
  // 목표 달성률 (0~100)
  progressPercent: () => number;
  // 연속 운동 일수 (streak)
  streak: () => number;
  // 목표 리셋 (새 목표 시작)
  resetGoal: (goal?: 7 | 21 | 100) => void;
}

export const useGoalStore = create<GoalState>((set, get) => {
  const initial = loadGoal();

  return {
    ...initial,

    setGoal: (goal) => {
      const updated = { ...get(), activeGoal: goal };
      saveGoal(updated);
      set({ activeGoal: goal });
    },

    markTodayComplete: () => {
      const today = new Date().toISOString().split("T")[0];
      const state = get();
      if (state.completedDates.includes(today)) return; // 이미 완료

      const updated = {
        ...state,
        completedDates: [...state.completedDates, today],
      };
      saveGoal(updated);
      set({ completedDates: updated.completedDates });
    },

    isTodayComplete: () => {
      const today = new Date().toISOString().split("T")[0];
      return get().completedDates.includes(today);
    },

    completedCount: () => get().completedDates.length,

    progressPercent: () => {
      const { completedDates, activeGoal } = get();
      return Math.min(100, Math.round((completedDates.length / activeGoal) * 100));
    },

    streak: () => {
      const dates = [...get().completedDates].sort().reverse();
      if (dates.length === 0) return 0;

      let count = 0;
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        const expectedStr = expected.toISOString().split("T")[0];
        if (dates.includes(expectedStr)) {
          count++;
        } else {
          break;
        }
      }
      return count;
    },

    resetGoal: (goal) => {
      const newGoal: GoalTracker = {
        startDate: new Date().toISOString().split("T")[0],
        completedDates: [],
        activeGoal: goal || get().activeGoal,
        watchedVideoIds: [],
      };
      saveGoal(newGoal);
      set(newGoal);
    },
  };
});
