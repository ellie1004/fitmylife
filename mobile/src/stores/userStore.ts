/**
 * 사용자 프로필 상태 관리 (Zustand)
 */

import { create } from "zustand";
import type { UserProfile } from "../types";

interface UserState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
}));
