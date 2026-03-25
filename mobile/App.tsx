/**
 * FitMyLife 메인 앱 엔트리포인트
 *
 * 단순 스택 네비게이션:
 *   온보딩(체크리스트) → 홈(대시보드) → 운동(영상 리스트) → 플레이어
 */

import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import VideoPlayerScreen from "./src/screens/VideoPlayerScreen";
import { useWorkoutStore } from "./src/stores/workoutStore";

type Screen = "onboarding" | "home" | "workout" | "player";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { reset } = useWorkoutStore();

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
