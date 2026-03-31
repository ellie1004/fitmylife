/**
 * 메인 대시보드 스크린 (Commercial UX Upgrade)
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy / Electric Blue / Emerald 컬러 팔레트
 * - Sticky CTA, Progressive Disclosure, Glassmorphism 카드
 * - 개인화 요약 최상단 배치, 가독성 높은 그리드 레이아웃
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { useWorkoutStore } from "../stores/workoutStore";
import { useUserStore } from "../stores/userStore";
import { useGoalStore } from "../stores/goalStore";
import { getBodyAreaVideos, BODY_AREA_LABELS } from "../services/api";
import type { TargetBodyArea, VideoItem } from "../types";

// ── 상업용 컬러 팔레트 (CLAUDE_PRO_SPEC §1) ──
const COLORS = {
  deepNavy: "#0F172A",
  electricBlue: "#3B82F6",
  emerald: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  cardGlass: "rgba(255,255,255,0.85)",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  warning: "#F59E0B",
  dangerLight: "#FEF2F2",
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

// 나이·성별 기반 일반 권장 식단 (의학적 조언이 아닌 일반 건강 정보)
function getDietTips(age: number, gender: "male" | "female"): { title: string; tips: string[]; calories: string } {
  const isSenior = age >= 60;
  const isYoung = age < 30;

  if (isSenior) {
    return {
      title: "시니어 건강 식단 가이드",
      calories: gender === "male" ? "1,800~2,200 kcal/일" : "1,600~2,000 kcal/일",
      tips: [
        "🥛 칼슘·비타민D 충분히 (우유, 멸치, 달걀)",
        "🍖 근감소 예방을 위해 단백질 매끼 섭취 (두부, 생선, 닭가슴살)",
        "🥬 식이섬유 풍부한 채소·과일 하루 5접시 이상",
        "💧 수분 섭취 하루 6~8잔 (갈증 느끼기 전에 마시기)",
        "🧂 나트륨 줄이기 — 국물 반만 드세요",
      ],
    };
  }

  if (gender === "male") {
    return {
      title: isYoung ? "20대 남성 활력 식단" : "30~50대 남성 균형 식단",
      calories: isYoung ? "2,400~2,800 kcal/일" : "2,200~2,600 kcal/일",
      tips: [
        "🍗 단백질 체중 1kg당 1.2~1.6g (닭가슴살, 달걀, 두부)",
        "🍚 탄수화물은 현미·잡곡 위주로 (백미 줄이기)",
        "🥑 건강한 지방 섭취 (아보카도, 견과류, 올리브오일)",
        "🥦 매끼 채소 반찬 2가지 이상",
        "🍺 음주 줄이기 — 주 2회 이하, 1회 소주 2잔 이내",
      ],
    };
  }

  return {
    title: isYoung ? "20대 여성 건강 식단" : "30~50대 여성 균형 식단",
    calories: isYoung ? "1,800~2,200 kcal/일" : "1,800~2,000 kcal/일",
    tips: [
      "🥗 철분 풍부한 식품 (시금치, 소고기, 두부) 꾸준히 섭취",
      "🍖 단백질 매끼 한 주먹 (달걀, 생선, 콩류, 닭가슴살)",
      "🥛 뼈 건강을 위해 칼슘·비타민D (우유, 요거트, 달걀)",
      "🫐 항산화 식품 챙기기 (베리류, 토마토, 브로콜리)",
      "💧 하루 물 8잔 이상 — 피부와 대사에 필수!",
    ],
  };
}

// 강도별 상세 운동 처방 안내
function getDetailedPrescription(intensity: string, exerciseType: string, timeMin: number): string[] {
  const common = [
    `⏱️ 운동 전 5분 워밍업 + 운동 후 5분 쿨다운을 꼭 포함하세요`,
    `💧 운동 중 15~20분 간격으로 물을 한 모금씩 마셔주세요`,
  ];

  if (intensity === "low") {
    return [
      ...common,
      `🎯 ${timeMin}분 동안 가볍게 몸을 풀어주는 스트레칭 위주로 진행하세요`,
      `🚶 무리하지 말고 통증이 느껴지면 즉시 멈추세요`,
      `📅 일주일에 쉬는 날을 충분히 두고 점진적으로 늘려가세요`,
      `👟 맨발보다는 쿠셔닝 있는 실내화를 추천드려요`,
    ];
  }
  if (intensity === "moderate") {
    return [
      ...common,
      `🎯 ${timeMin}분 동안 약간 숨이 찰 정도의 강도를 유지하세요`,
      `💪 "대화는 가능하지만 노래는 어려운" 정도가 적당합니다`,
      `📅 운동 후 48시간 회복 시간을 두면 근육 성장에 효과적이에요`,
      `🍌 운동 30분 전 바나나 하나, 운동 후에는 탄수화물·단백질이 포함된 균형 잡힌 식사를 해주세요`,
    ];
  }
  return [
    ...common,
    `🎯 ${timeMin}분 고강도 운동 — 심박수 최대의 70~85% 유지`,
    `📅 고강도 운동은 연속하지 말고 중간에 저강도 운동으로 교차하세요`,
    `🍚 고강도 운동 후에는 소모된 탄수화물 보충이 중요해요 — 균형 잡힌 식사로 회복하세요`,
  ];
}

// 고민 부위 목록 (선택 가능한 전체 부위)
const ALL_BODY_AREAS: TargetBodyArea[] = [
  "jawline", "arms", "belly", "back", "shoulders", "thighs", "hips", "calves",
];

interface Props {
  onStartWorkout: () => void;
  onRestart: () => void;
  onStartTargetWorkout?: (videos: VideoItem[], area: string) => void;
}

export default function HomeScreen({ onStartWorkout, onRestart, onStartTargetWorkout }: Props) {
  const { workoutPlan } = useWorkoutStore();
  const { profile, setProfile } = useUserStore();
  const goal = useGoalStore();
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<TargetBodyArea[]>(
    profile?.targetAreas || []
  );
  // Progressive Disclosure: 아코디언 상태
  const [showGuide, setShowGuide] = useState(false);
  const [showDiet, setShowDiet] = useState(false);

  // 고민 부위 토글
  const toggleBodyArea = (area: TargetBodyArea) => {
    setSelectedAreas((prev) => {
      const next = prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area];
      if (profile) {
        setProfile({ ...profile, targetAreas: next });
      }
      return next;
    });
  };

  // 고민 부위 운동 시작
  const handleStartTargetWorkout = () => {
    if (selectedAreas.length === 0) return;
    const videos = getBodyAreaVideos(selectedAreas);
    const areaLabel = selectedAreas
      .map((a) => BODY_AREA_LABELS[a].label)
      .join("·");
    if (onStartTargetWorkout) {
      onStartTargetWorkout(videos, areaLabel);
    }
  };

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
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero 헤더 (§6: 강력한 Copywriting) ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>
                안녕하세요, {profile?.nickname || "회원"}님
              </Text>
              <Text style={styles.greetingSub}>오늘도 건강한 하루를 시작해볼까요?</Text>
            </View>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>FitMyLife</Text>
            </View>
          </View>

          {/* 개인화 요약 카드 (§6: Dashboard 고도화 — 최상단 배치) */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>
              {fitt.intensity === "low" ? "🌱" : fitt.intensity === "moderate" ? "💪" : "🔥"}
            </Text>
            <Text style={styles.heroMessage}>{message}</Text>
          </View>
        </View>

        {/* ── 목표 트래커 카드 ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>나의 운동 목표</Text>
            <TouchableOpacity
              onPress={() => setShowGoalPicker(!showGoalPicker)}
              style={styles.goalBadge}
            >
              <Text style={styles.goalBadgeText}>
                {goalInfo.emoji} {goalInfo.label} ▾
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
                      goal.activeGoal === g && { color: COLORS.electricBlue },
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
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: isGoalComplete ? COLORS.emerald : COLORS.electricBlue,
                },
              ]}
            />
          </View>

          {/* 통계 그리드 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{goal.completedCount()}</Text>
              <Text style={styles.statLabel}>완료일</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(0, goal.activeGoal - goal.completedCount())}
              </Text>
              <Text style={styles.statLabel}>남은일</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, streakDays >= 3 && { color: COLORS.warning }]}>
                {streakDays}일
              </Text>
              <Text style={styles.statLabel}>연속</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.emerald }]}>
                {progressPct}%
              </Text>
              <Text style={styles.statLabel}>달성률</Text>
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
                <Text style={styles.linkArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── FITT 처방 요약 ── */}
        <View style={styles.card}>
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

        {/* ── 상세 운동 가이드 (Progressive Disclosure — 아코디언) ── */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setShowGuide(!showGuide)}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionTitle}>📋 운동 가이드</Text>
            <Text style={styles.accordionArrow}>{showGuide ? "▲" : "▼"}</Text>
          </TouchableOpacity>
          {showGuide &&
            getDetailedPrescription(fitt.intensity, fitt.exercise_type, fitt.time_minutes).map((tip, i) => (
              <Text key={i} style={styles.tipText}>{tip}</Text>
            ))
          }
          {!showGuide && (
            <Text style={styles.accordionHint}>탭하여 상세 가이드 보기</Text>
          )}
        </View>

        {/* ── 맞춤 식단 가이드 (Progressive Disclosure — 아코디언) ── */}
        {profile && (
          <View style={styles.dietCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowDiet(!showDiet)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>
                🍽️ {getDietTips(profile.age, profile.gender).title}
              </Text>
              <Text style={styles.accordionArrow}>{showDiet ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {/* 칼로리는 항상 표시 (핵심 정보) */}
            <View style={styles.calorieBox}>
              <Text style={styles.calorieLabel}>일일 권장 칼로리</Text>
              <Text style={styles.calorieValue}>
                {getDietTips(profile.age, profile.gender).calories}
              </Text>
            </View>

            {showDiet && (
              <>
                {getDietTips(profile.age, profile.gender).tips.map((tip, i) => (
                  <Text key={i} style={styles.tipText}>{tip}</Text>
                ))}
                <Text style={styles.disclaimer}>
                  * 일반적인 건강 정보이며 의학적 조언이 아닙니다
                </Text>
              </>
            )}
            {!showDiet && (
              <Text style={styles.accordionHint}>탭하여 상세 식단 보기</Text>
            )}
          </View>
        )}

        {/* ── 고민 부위 선택 운동 ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎯 고민 부위 집중 운동</Text>
          <Text style={styles.subtitleText}>
            빼고 싶거나 걱정되는 부위를 선택하면{"\n"}맞춤 영상을 추천해드려요!
          </Text>
          <View style={styles.chipGrid}>
            {ALL_BODY_AREAS.map((area) => {
              const info = BODY_AREA_LABELS[area];
              const isSelected = selectedAreas.includes(area);
              return (
                <TouchableOpacity
                  key={area}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleBodyArea(area)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipEmoji}>{info.emoji}</Text>
                  <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedAreas.length > 0 && (
            <TouchableOpacity
              style={styles.targetStartBtn}
              onPress={handleStartTargetWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.targetStartBtnText}>
                ▶  {selectedAreas.map((a) => BODY_AREA_LABELS[a].label).join(" + ")} 운동 보기
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── 오늘의 운동 프리뷰 ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
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

        {/* 온라인 스포츠 센터 참고 링크 */}
        <TouchableOpacity
          style={styles.refCard}
          onPress={() => Linking.openURL("https://www.ksponco.or.kr/onlinesports/")}
          activeOpacity={0.7}
        >
          <Text style={styles.refIcon}>🏅</Text>
          <View style={styles.refTextWrap}>
            <Text style={styles.refTitle}>국민체육진흥공단 온라인 스포츠센터</Text>
            <Text style={styles.refDesc}>
              더 다양한 운동 콘텐츠가 궁금하다면 참고해보세요!
            </Text>
          </View>
          <Text style={styles.linkArrow}>→</Text>
        </TouchableOpacity>

        {/* 다시 진단하기 */}
        <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartText}>체크리스트 다시하기</Text>
        </TouchableOpacity>

        {/* 하단 크레딧 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Designed by </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://nugunaai.com/")}>
            <Text style={styles.footerLink}>NuGuNaAi Ellie</Text>
          </TouchableOpacity>
        </View>

        {/* Sticky CTA 높이만큼 하단 여백 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Sticky CTA (§3: 스크롤 시에도 화면 하단 고정) ── */}
      <View style={styles.stickyCta}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleStartWorkout} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>
            {goal.isTodayComplete() ? "▶  운동 다시 보기" : "▶  오늘의 운동 시작하기"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── 스타일 (§1 디자인 시스템 반영) ──
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  scrollView: { flex: 1 },
  content: { paddingBottom: 0 },

  // ── Hero 섹션 ──
  heroSection: {
    backgroundColor: COLORS.deepNavy,
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  logoBadge: {
    backgroundColor: "rgba(59,130,246,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.electricBlue,
    letterSpacing: -0.5,
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroEmoji: { fontSize: 36, marginRight: 16 },
  heroMessage: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 24,
  },

  // ── 공통 카드 (Glassmorphism 느낌) ──
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.cardGlass,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.deepNavy,
    letterSpacing: -0.3,
  },

  // ── 목표 트래커 ──
  goalBadge: {
    backgroundColor: "rgba(59,130,246,0.1)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.electricBlue,
  },
  goalPicker: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    padding: 8,
  },
  goalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  goalOptionActive: { backgroundColor: "rgba(59,130,246,0.08)" },
  goalOptionEmoji: { fontSize: 20, marginRight: 12 },
  goalOptionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  goalOptionDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  goalCheck: { fontSize: 16, fontWeight: "700", color: COLORS.electricBlue },
  progressBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.electricBlue,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  goalCompleteBox: {
    marginTop: 16,
    backgroundColor: "rgba(16,185,129,0.08)",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  goalCompleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.emerald,
    textAlign: "center",
  },
  goalUpgradeBtn: {
    marginTop: 10,
    backgroundColor: COLORS.emerald,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  goalUpgradeBtnText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  todayDoneText: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.emerald,
  },

  // ── 시니어 안내 ──
  seniorCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  seniorTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  seniorDesc: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
  seniorLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seniorLinkTitle: { fontSize: 14, fontWeight: "700", color: COLORS.electricBlue },
  seniorLinkDesc: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  linkArrow: { fontSize: 18, color: COLORS.warning, fontWeight: "700", marginLeft: 8 },

  // ── FITT ──
  fittGrid: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  fittItem: { alignItems: "center", flex: 1 },
  fittValue: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.electricBlue,
    marginBottom: 4,
    textAlign: "center",
  },
  fittLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "500" },
  fittDivider: { width: 1, height: 36, backgroundColor: COLORS.border },
  progressionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  progressionIcon: { fontSize: 18, marginRight: 10 },
  progressionText: { flex: 1, fontSize: 13, color: COLORS.warning, fontWeight: "600" },

  // ── 아코디언 (Progressive Disclosure §2) ──
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accordionArrow: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  accordionHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 4,
    paddingLeft: 4,
  },

  // ── 식단 가이드 ──
  dietCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(16,185,129,0.05)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
  },
  calorieBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  calorieLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  calorieValue: { fontSize: 16, fontWeight: "800", color: COLORS.emerald },
  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  // ── 고민 부위 ──
  subtitleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: "rgba(59,130,246,0.08)",
    borderColor: COLORS.electricBlue,
  },
  chipEmoji: { fontSize: 16, marginRight: 6 },
  chipLabel: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  chipLabelSelected: { color: COLORS.electricBlue, fontWeight: "700" },
  targetStartBtn: {
    marginTop: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.warning, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },
  targetStartBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  // ── 프리뷰 ──
  videoBadge: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  videoBadgeText: { fontSize: 12, fontWeight: "600", color: COLORS.emerald },
  previewQuery: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, marginBottom: 4 },
  previewTarget: { fontSize: 13, color: COLORS.textSecondary },

  // ── 참고 링크 ──
  refCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  refIcon: { fontSize: 24, marginRight: 12 },
  refTextWrap: { flex: 1 },
  refTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 2 },
  refDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 16 },

  // ── 하단 ──
  restartButton: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  restartText: { fontSize: 14, color: COLORS.textSecondary, textDecorationLine: "underline" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 8,
  },
  footerText: { fontSize: 11, color: COLORS.textMuted },
  footerLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emerald,
    textDecorationLine: "underline",
  },

  // ── Sticky CTA (§3: Conversion Rate Optimization) ──
  stickyCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: "rgba(248,250,252,0.95)",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.electricBlue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  ctaButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});
