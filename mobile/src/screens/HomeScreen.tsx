/**
 * 메인 대시보드 스크린
 *
 * FITT-VP 처방 요약, 목표 트래커, 시니어 안내, 오늘의 운동을 보여줍니다.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from "react-native";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useGoalStore } from "../stores/goalStore";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  warning: "#FF9800",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
};

const INTENSITY_LABEL: Record<string, string> = {
  low: "저강도",
  moderate: "중강도",
  high: "고강도",
};

const TYPE_LABEL: Record<string, string> = {
  flexibility: "유연성 운동",
  balance: "밸런스 운동",
  cardio: "유산소 운동",
  strength: "근력 운동",
};

const GOALS = [3, 7, 21, 100] as const;
const GOAL_LABELS: Record<number, { label: string; emoji: string; desc: string }> = {
  3:   { label: "3일", emoji: "✊", desc: "작심 3일 깨부수기" },
  7:   { label: "7일", emoji: "🌱", desc: "운동 습관 만들기" },
  21:  { label: "21일", emoji: "💪", desc: "습관 고정하기" },
  100: { label: "100일", emoji: "🔥", desc: "인생이 바뀌는 도전" },
};

// 시니어 전용 운동 사이트 목록
const SENIOR_SITES = [
  { name: "국민체력100 (시니어)", url: "https://nfa.kspo.or.kr/", desc: "체력인증 + 맞춤 운동 처방" },
  { name: "100세 건강체조", url: "https://www.ksponco.or.kr/onlinesports/", desc: "온라인 스포츠센터 시니어 프로그램" },
];

interface Props {
  onStartWorkout: () => void;
  onRestart: () => void;
}

export default function HomeScreen({ onStartWorkout, onRestart }: Props) {
  const { workoutPlan } = useWorkoutStore();
  const { profile } = useUserStore();
  const goal = useGoalStore();
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  if (!workoutPlan) return null;

  const { fitt, message, videos } = workoutPlan;
  const isSenior = (profile?.age || 0) >= 60;

  // 운동 시작 + 오늘 운동 기록
  const handleStartWorkout = () => {
    goal.markTodayComplete();
    onStartWorkout();
  };

  const progressPct = goal.progressPercent();
  const streakDays = goal.streak();
  const goalInfo = GOAL_LABELS[goal.activeGoal];
  const isGoalComplete = goal.completedCount() >= goal.activeGoal;

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

      {/* ── 목표 트래커 카드 ── */}
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.sectionTitle}>나의 운동 목표</Text>
          <TouchableOpacity onPress={() => setShowGoalPicker(!showGoalPicker)}>
            <Text style={styles.goalChangeBtn}>
              {goalInfo.emoji} {goalInfo.label} 목표 ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* 목표 선택 드롭다운 */}
        {showGoalPicker && (
          <View style={styles.goalPicker}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.goalOption,
                  goal.activeGoal === g && styles.goalOptionActive,
                ]}
                onPress={() => {
                  goal.setGoal(g);
                  setShowGoalPicker(false);
                }}
              >
                <Text style={styles.goalOptionEmoji}>{GOAL_LABELS[g].emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    styles.goalOptionLabel,
                    goal.activeGoal === g && { color: COLORS.primary },
                  ]}>
                    {GOAL_LABELS[g].label}
                  </Text>
                  <Text style={styles.goalOptionDesc}>{GOAL_LABELS[g].desc}</Text>
                </View>
                {goal.activeGoal === g && <Text style={styles.goalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 프로그레스 바 */}
        <View style={styles.goalProgressBg}>
          <View
            style={[
              styles.goalProgressFill,
              {
                width: `${progressPct}%`,
                backgroundColor: isGoalComplete ? "#4CAF50" : COLORS.primary,
              },
            ]}
          />
        </View>

        <View style={styles.goalStats}>
          <View style={styles.goalStat}>
            <Text style={styles.goalStatValue}>{goal.completedCount()}</Text>
            <Text style={styles.goalStatLabel}>완료일</Text>
          </View>
          <View style={styles.goalStatDivider} />
          <View style={styles.goalStat}>
            <Text style={styles.goalStatValue}>{goal.activeGoal - goal.completedCount() > 0 ? goal.activeGoal - goal.completedCount() : 0}</Text>
            <Text style={styles.goalStatLabel}>남은일</Text>
          </View>
          <View style={styles.goalStatDivider} />
          <View style={styles.goalStat}>
            <Text style={[styles.goalStatValue, streakDays >= 3 && { color: COLORS.warning }]}>
              {streakDays}일
            </Text>
            <Text style={styles.goalStatLabel}>연속</Text>
          </View>
          <View style={styles.goalStatDivider} />
          <View style={styles.goalStat}>
            <Text style={[styles.goalStatValue, { color: COLORS.accent }]}>
              {progressPct}%
            </Text>
            <Text style={styles.goalStatLabel}>달성률</Text>
          </View>
        </View>

        {/* 목표 달성 메시지 */}
        {isGoalComplete && (
          <View style={styles.goalCompleteBox}>
            <Text style={styles.goalCompleteText}>
              🎉 {goalInfo.label} 목표 달성! 다음 단계에 도전해보세요!
            </Text>
            <TouchableOpacity
              style={styles.goalUpgradeBtn}
              onPress={() => {
                const nextGoal = GOALS[GOALS.indexOf(goal.activeGoal) + 1];
                if (nextGoal) goal.resetGoal(nextGoal);
              }}
            >
              <Text style={styles.goalUpgradeBtnText}>
                {goal.activeGoal === 3
                  ? "7일 도전 →"
                  : goal.activeGoal === 7
                  ? "21일 도전 →"
                  : goal.activeGoal === 21
                  ? "100일 도전 →"
                  : "🏆 마스터 완료!"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 오늘 운동 완료 여부 */}
        {goal.isTodayComplete() && !isGoalComplete && (
          <Text style={styles.todayDoneText}>✅ 오늘 운동 완료!</Text>
        )}
      </View>

      {/* ── 시니어 전용 안내 ── */}
      {isSenior && (
        <View style={styles.seniorCard}>
          <Text style={styles.seniorTitle}>🤝 시니어 맞춤 운동 안내</Text>
          <Text style={styles.seniorDesc}>
            안전하고 효과적인 시니어 전용 운동 프로그램을 이용해보세요!
          </Text>
          {SENIOR_SITES.map((site) => (
            <TouchableOpacity
              key={site.url}
              style={styles.seniorLink}
              onPress={() => Linking.openURL(site.url)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.seniorLinkTitle}>{site.name}</Text>
                <Text style={styles.seniorLinkDesc}>{site.desc}</Text>
              </View>
              <Text style={styles.seniorArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
      <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
        <Text style={styles.startButtonText}>
          {goal.isTodayComplete() ? "▶  운동 다시 보기" : "▶  오늘의 운동 시작하기"}
        </Text>
      </TouchableOpacity>

      {/* 온라인 스포츠 센터 참고 링크 */}
      <TouchableOpacity
        style={styles.refCard}
        onPress={() =>
          Linking.openURL("https://www.ksponco.or.kr/onlinesports/")
        }
        activeOpacity={0.7}
      >
        <Text style={styles.refIcon}>🏅</Text>
        <View style={styles.refTextWrap}>
          <Text style={styles.refTitle}>국민체육진흥공단 온라인 스포츠센터</Text>
          <Text style={styles.refDesc}>
            더 다양한 운동 콘텐츠가 궁금하다면 참고해보세요!
          </Text>
        </View>
        <Text style={styles.refArrow}>→</Text>
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
  screen: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  greeting: { fontSize: 16, color: COLORS.text, fontWeight: "500" },
  appName: { fontSize: 18, fontWeight: "900", color: COLORS.primary, letterSpacing: -0.3 },
  messageCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.primary,
    borderRadius: 20, padding: 24, flexDirection: "row", alignItems: "center",
  },
  messageEmoji: { fontSize: 36, marginRight: 16 },
  messageText: { flex: 1, fontSize: 17, fontWeight: "600", color: "#FFF", lineHeight: 26 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 16 },

  // ── 목표 트래커 ──
  goalCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.card,
    borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  goalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  goalChangeBtn: {
    fontSize: 13, fontWeight: "700", color: COLORS.primary,
    backgroundColor: "#EBF3FB", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  goalPicker: {
    marginTop: 12, borderRadius: 12, backgroundColor: COLORS.bg, padding: 8,
  },
  goalOption: {
    flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 10, marginBottom: 4,
  },
  goalOptionActive: { backgroundColor: "#EBF3FB" },
  goalOptionEmoji: { fontSize: 20, marginRight: 12 },
  goalOptionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  goalOptionDesc: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  goalCheck: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  goalProgressBg: {
    height: 8, backgroundColor: "#E5E7EB", borderRadius: 4, marginTop: 16, overflow: "hidden",
  },
  goalProgressFill: { height: "100%", borderRadius: 4 },
  goalStats: {
    flexDirection: "row", justifyContent: "space-around", marginTop: 16,
  },
  goalStat: { alignItems: "center", flex: 1 },
  goalStatValue: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  goalStatLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: "500", marginTop: 2 },
  goalStatDivider: { width: 1, height: 30, backgroundColor: "#E5E7EB" },
  goalCompleteBox: {
    marginTop: 16, backgroundColor: "#ECFDF5", borderRadius: 12, padding: 14, alignItems: "center",
  },
  goalCompleteText: { fontSize: 14, fontWeight: "700", color: COLORS.accent, textAlign: "center" },
  goalUpgradeBtn: {
    marginTop: 10, backgroundColor: COLORS.accent, borderRadius: 8,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  goalUpgradeBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  todayDoneText: {
    textAlign: "center", marginTop: 12, fontSize: 14, fontWeight: "700", color: COLORS.accent,
  },

  // ── 시니어 안내 ──
  seniorCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: "#FFF7ED",
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#FDE68A",
  },
  seniorTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  seniorDesc: { fontSize: 13, color: COLORS.textLight, lineHeight: 20, marginBottom: 12 },
  seniorLink: {
    flexDirection: "row", alignItems: "center", backgroundColor: COLORS.card,
    borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  seniorLinkTitle: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  seniorLinkDesc: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  seniorArrow: { fontSize: 18, color: COLORS.warning, fontWeight: "700", marginLeft: 8 },

  // ── FITT ──
  fittCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.card,
    borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  fittGrid: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  fittItem: { alignItems: "center", flex: 1 },
  fittValue: { fontSize: 15, fontWeight: "800", color: COLORS.primary, marginBottom: 4, textAlign: "center" },
  fittLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: "500" },
  fittDivider: { width: 1, height: 36, backgroundColor: "#E5E7EB" },
  progressionBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFF7ED",
    borderRadius: 12, padding: 12, marginTop: 16,
  },
  progressionIcon: { fontSize: 18, marginRight: 10 },
  progressionText: { flex: 1, fontSize: 13, color: COLORS.warning, fontWeight: "600" },

  // ── 프리뷰 ──
  previewCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: COLORS.card,
    borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  videoBadge: { backgroundColor: "#ECFDF5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  videoBadgeText: { fontSize: 12, fontWeight: "600", color: COLORS.accent },
  previewQuery: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  previewTarget: { fontSize: 13, color: COLORS.textLight },

  // ── 버튼 ──
  startButton: {
    marginHorizontal: 16, marginTop: 24, backgroundColor: COLORS.accent,
    borderRadius: 16, paddingVertical: 18, alignItems: "center",
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  startButtonText: { color: "#FFF", fontSize: 17, fontWeight: "700" },
  refCard: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 20,
    backgroundColor: "#FFFBEB", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#FDE68A",
  },
  refIcon: { fontSize: 24, marginRight: 12 },
  refTextWrap: { flex: 1 },
  refTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  refDesc: { fontSize: 11, color: COLORS.textLight, lineHeight: 16 },
  refArrow: { fontSize: 18, color: COLORS.warning, fontWeight: "700", marginLeft: 8 },
  restartButton: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  restartText: { fontSize: 14, color: COLORS.textLight, textDecorationLine: "underline" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 24, paddingBottom: 8 },
  footerText: { fontSize: 11, color: "#9CA3AF" },
  footerLink: { fontSize: 11, fontWeight: "700", color: COLORS.accent, textDecorationLine: "underline" },
});
