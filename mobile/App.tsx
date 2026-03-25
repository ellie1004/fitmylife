/**
 * FitMyLife 메인 앱 엔트리포인트
 *
 * 단순 스택 네비게이션:
 *   온보딩(체크리스트) → 홈(대시보드) → 운동(영상 리스트) → 플레이어
 */

import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import VideoPlayerScreen from "./src/screens/VideoPlayerScreen";
import { useWorkoutStore } from "./src/stores/workoutStore";
import { useUserStore } from "./src/stores/userStore";
import type { WorkoutPlan } from "./src/types";

// 데모용 운동 플랜 — 배포 시 홈 화면을 바로 보여주기 위한 샘플 데이터
const DEMO_PLAN: WorkoutPlan = {
  fitt: {
    frequency: 3,
    intensity: "low",
    time_minutes: 15,
    exercise_type: "flexibility",
    volume: "light",
    progression: "2주마다 운동 시간 5분 증가",
  },
  videos: [
    {
      video_id: "50WCSpZtdmA",
      title: "[ENG] 심으뜸 매일 아침 10분 스트레칭ㅣ2023 리뉴얼",
      channel_title: "힙으뜸",
      thumbnail_url: "https://i.ytimg.com/vi/50WCSpZtdmA/hqdefault.jpg",
      duration_seconds: 625,
      view_count: 5750929,
      score: 56.15,
    },
    {
      video_id: "yyjOhsNEqtE",
      title: "[ENG] 운동 전 최고의 스트레칭! 10분만 따라해도 운동효과 대박!",
      channel_title: "힙으뜸",
      thumbnail_url: "https://i.ytimg.com/vi/yyjOhsNEqtE/hqdefault.jpg",
      duration_seconds: 660,
      view_count: 8253317,
      score: 55.29,
    },
    {
      video_id: "8VtkpMGw0hw",
      title: "자기전 숙면을 도와주는 10분 스트레칭",
      channel_title: "힙으뜸",
      thumbnail_url: "https://i.ytimg.com/vi/8VtkpMGw0hw/hqdefault.jpg",
      duration_seconds: 571,
      view_count: 2744673,
      score: 55.16,
    },
  ],
  search_query: "초보자 홈트 스트레칭 15분",
  target_area: "전신",
  message: "무리하지 않는 선에서 천천히 시작해요! 🌱",
};

type Screen = "onboarding" | "home" | "workout" | "player";

export default function App() {
  const { workoutPlan, setWorkoutPlan } = useWorkoutStore();
  const { profile, setProfile } = useUserStore();

  // 워크아웃 플랜이 없으면 데모 데이터로 홈 화면 표시
  const [screen, setScreen] = useState<Screen>(
    workoutPlan ? "home" : "home"
  );
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { reset } = useWorkoutStore();

  useEffect(() => {
    if (!workoutPlan) {
      setWorkoutPlan(DEMO_PLAN);
    }
    if (!profile) {
      setProfile({ age: 30, gender: "female", nickname: "게스트" });
    }
  }, []);

  const handleSelectVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setScreen("player");
  };

  const handleRestart = () => {
    reset();
    setScreen("onboarding");
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      {screen === "onboarding" && (
        <OnboardingScreen onComplete={() => setScreen("home")} />
      )}

      {screen === "home" && (
        <HomeScreen
          onStartWorkout={() => setScreen("workout")}
          onRestart={handleRestart}
        />
      )}

      {screen === "workout" && (
        <WorkoutScreen
          onSelectVideo={handleSelectVideo}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "player" && selectedVideoId && (
        <VideoPlayerScreen
          videoId={selectedVideoId}
          onBack={() => setScreen("workout")}
          onSelectVideo={handleSelectVideo}
        />
      )}
    </SafeAreaProvider>
  );
}
