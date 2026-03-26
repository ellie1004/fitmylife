/**
 * 사용자 프로필 상태 관리 (Zustand + localStorage 영속화)
 *
 * 재방문 시 프로필을 유지하여 바로 운동 처방 화면으로 진입합니다.
 */

import { create } from "zustand";
import type { UserProfile } from "../types";

const STORAGE_KEY = "fitmylife_profile";

function loadProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // 무시
  }
}

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: loadProfile(),
  setProfile: (profile) => {
    saveProfile(profile);
    set({ profile });
  },
  clearProfile: () => {
    saveProfile(null);
    set({ profile: null });
  },
}));
