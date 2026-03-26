/**
 * 메인 대시보드 스크린
 *
 * FITT-VP 처방 요약, 오늘의 운동 메시지, 점수 요약을 보여줍니다.
 * 하단에 "오늘의 운동 시작" 버튼으로 WorkoutScreen으로 이동합니다.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import ProgressBar from "../components/ProgressBar";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  warning: "#FF9800",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
};

// 강도 한국어 매핑
const INTENSITY_LABEL: Record<string, string> = {
  low: "저강도",
  moderate: "중강도",
  high: "고강도",
};

// 운동 유형 한국어 매핑
const TYPE_LABEL: Record<string, string> = {
  flexibility: "유연성 운동",
  balance: "밸런스 운동",
  cardio: "유산소 운동",
  strength: "근력 운동",
};

interface Props {
  onStartWorkout: () => void;
  onRestart: () => void;
}

export default function HomeScreen({ onStartWorkout, onRestart }: Props) {
  const { workoutPlan, checklistResult } = useWorkoutStore();
  const { profile } = useUserStore();

  if (!workoutPlan) return null;

  const { fitt, message, videos } = workoutPlan;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          안녕하세요, {profile?.nickname || "회원"}님 👋
        </Text>
        <Text style={styles.appName}>FitMyLife</Text>
      </View>

      {/* 오늘의 메시지 카드 */}
      <View style={styles.messageCard}>
        <Text style={styles.messageEmoji}>
          {fitt.intensity === "low"
            ? "🌱"
            : fitt.intensity === "moderate"
            ? "💪"
            : "🔥"}
        </Text>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {/* FITT 처방 요약 */}
      <View style={styles.fittCard}>
        <Text style={styles.sectionTitle}>나의 운동 처방</Text>
        <View style={styles.fittGrid}>
          <View style={styles.fittItem}>
            <Text style={styles.fittValue}>{fitt.frequency}회</Text>
            <Text style={styles.fittLabel}>주간 빈도</Text>
          </View>
          <View style={styles.fittDivider} />
          <View style={styles.fittItem}>
            <Text style={styles.fittValue}>
              {INTENSITY_LABEL[fitt.intensity] || fitt.intensity}
            </Text>
            <Text style={styles.fittLabel}>운동 강도</Text>
          </View>
          <View style={styles.fittDivider} />
          <View style={styles.fittItem}>
            <Text style={styles.fittValue}>{fitt.time_minutes}분</Text>
            <Text style={styles.fittLabel}>운동 시간</Text>
          </View>
          <View style={styles.fittDivider} />
          <View style={styles.fittItem}>
            <Text style={styles.fittValue}>
              {TYPE_LABEL[fitt.exercise_type] || fitt.exercise_type}
            </Text>
            <Text style={styles.fittLabel}>운동 유형</Text>
          </View>
        </View>

        {/* 점진성 가이드 */}
        <View style={styles.progressionBox}>
          <Text style={styles.progressionIcon}>📈</Text>
          <Text style={styles.progressionText}>{fitt.progression}</Text>
        </View>
      </View>

      {/* 오늘의 운동 프리뷰 */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <Text style={styles.sectionTitle}>오늘의 운동</Text>
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>
              {videos.length}개 영상 준비됨
            </Text>
          </View>
        </View>

        <Text style={styles.previewQuery}>
          🔍 "{workoutPlan.search_query}"
        </Text>
        <Text style={styles.previewTarget}>
          타겟: {workoutPlan.target_area}
        </Text>
      </View>

      {/* CTA 버튼 */}
      <TouchableOpacity style={styles.startButton} onPress={onStartWorkout}>
        <Text style={styles.startButtonText}>▶  오늘의 운동 시작하기</Text>
      </TouchableOpacity>

      {/* 다시 진단하기 */}
      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartText}>체크리스트 다시하기</Text>
      </TouchableOpacity>

      {/* 하단 크레딧 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Designed by </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://nugunaai.com/")}
        >
          <Text style={styles.footerLink}>NuGuNaAi Ellie</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingBottom: 40,
  },
  // 헤더
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  appName: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  // 메시지 카드
  messageCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  messageEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  messageText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
    lineHeight: 26,
  },
  // FITT 카드
  fittCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  fittGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  fittItem: {
    alignItems: "center",
    flex: 1,
  },
  fittValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: "center",
  },
  fittLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  fittDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },
  progressionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  progressionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  progressionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: "600",
  },
  // 프리뷰 카드
  previewCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  videoBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  videoBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },
  previewQuery: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  previewTarget: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  // 버튼
  startButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
  restartButton: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  restartText: {
    fontSize: 14,
    color: COLORS.textLight,
    textDecorationLine: "underline",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    textDecorationLine: "underline",
  },
});
