/**
 * 온보딩 & 체크리스트 진단 스크린 (Commercial UX)
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy / Electric Blue / Emerald 컬러 통일
 * - 프리미엄 카드 디자인 + 부드러운 전환
 * - Zero-Friction 온보딩 플로우
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import ChecklistCard from "../components/ChecklistCard";
import { fetchQuestions, generatePrescription } from "../services/api";
import { useUserStore } from "../stores/userStore";
import { useWorkoutStore } from "../stores/workoutStore";
import type { ChecklistQuestion, ChecklistAnswer } from "../types";

const COLORS = {
  deepNavy: "#0F172A",
  electricBlue: "#3B82F6",
  emerald: "#10B981",
  bg: "#F8FAFC",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
};

// 체크리스트 진행 중 보여줄 동기부여 문구 (카테고리별)
const MOTIVATIONAL_QUOTES: Record<string, { emoji: string; text: string }[]> = {
  physical_activity: [
    { emoji: "🏃‍♂️", text: "몸이 움직이면 마음도 움직여요" },
    { emoji: "💪", text: "작은 움직임이 큰 변화의 시작!" },
  ],
  diet: [
    { emoji: "🥗", text: "잘 먹는 것도 운동의 일부예요" },
    { emoji: "🍎", text: "좋은 연료가 좋은 퍼포먼스를 만들어요" },
  ],
  sleep: [
    { emoji: "😴", text: "충분한 휴식이 근육을 만들어요" },
    { emoji: "🌙", text: "잠자는 동안 몸이 회복돼요" },
  ],
  stress: [
    { emoji: "🧘‍♀️", text: "운동은 최고의 스트레스 해소법!" },
    { emoji: "🌊", text: "깊은 호흡, 그리고 한 발짝" },
  ],
  health_status: [
    { emoji: "❤️", text: "건강이 최고의 재산이에요" },
    { emoji: "🩺", text: "내 몸을 아는 것이 첫걸음" },
  ],
  exercise_experience: [
    { emoji: "🔥", text: "경험은 상관없어요, 시작이 반!" },
    { emoji: "🏆", text: "어제의 나보다 오늘의 내가 더 강해요" },
  ],
};

const LOADING_EMOJIS = ["🏋️", "🧘‍♀️", "🏃‍♂️", "🚴‍♀️", "🤸‍♀️", "🏊‍♀️"];

interface Props {
  onComplete: () => void;
}

type Step = "profile" | "checklist" | "loading";

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("profile");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const fadeAnim = useState(new Animated.Value(1))[0];
  const [currentLoadingEmoji, setCurrentLoadingEmoji] = useState(0);

  const { setProfile } = useUserStore();
  const { setWorkoutPlan, setChecklistResult } = useWorkoutStore();

  useEffect(() => {
    fetchQuestions().then(setQuestions).catch(() => {});
  }, []);

  useEffect(() => {
    if (step !== "loading") return;
    const interval = setInterval(() => {
      setCurrentLoadingEmoji((prev) => (prev + 1) % LOADING_EMOJIS.length);
    }, 600);
    return () => clearInterval(interval);
  }, [step]);

  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0, duration: 150, useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 200, useNativeDriver: true,
      }).start();
    });
  };

  const handleProfileDone = () => {
    if (!nickname.trim() || !age || !gender) return;
    setProfile({
      age: parseInt(age),
      gender,
      nickname: nickname.trim(),
      height: height ? parseInt(height) : undefined,
      weight: weight ? parseInt(weight) : undefined,
    });
    setStep("checklist");
  };

  const handleSelect = (value: number) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        animateTransition(() => setCurrentQ(currentQ + 1));
      } else {
        handleSubmit(newAnswers);
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentQ > 0) {
      animateTransition(() => setCurrentQ(currentQ - 1));
    }
  };

  const handleSubmit = async (finalAnswers: Record<string, number>) => {
    setStep("loading");
    const userAge = parseInt(age);
    const answerList: ChecklistAnswer[] = Object.entries(finalAnswers).map(
      ([question_id, value]) => ({ question_id, value })
    );
    try {
      const plan = await generatePrescription({
        answers: answerList,
        user_age: userAge,
        user_gender: gender!,
      });
      setWorkoutPlan(plan);
      onComplete();
    } catch (err) {
      console.warn("처방 생성 실패:", err);
      setStep("checklist");
    }
  };

  const getMotivation = () => {
    if (!questions[currentQ]) return null;
    const cat = questions[currentQ].category;
    const quotes = MOTIVATIONAL_QUOTES[cat] || MOTIVATIONAL_QUOTES.physical_activity;
    return quotes[currentQ % quotes.length];
  };

  // ── 프로필 입력 단계 ──
  if (step === "profile") {
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.profileContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* 상단 브랜딩 */}
          <View style={styles.profileHeroEmojis}>
            <Text style={styles.heroEmojiText}>🏋️  🧘‍♀️  🏃‍♂️</Text>
          </View>

          <Text style={styles.logo}>FitMyLife</Text>
          <Text style={styles.subtitle}>
            나에게 딱 맞는 운동을 찾아볼까요?
          </Text>

          <View style={styles.profileCard}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 엘리"
              placeholderTextColor={COLORS.textMuted}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>나이</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 28"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />

            <View style={styles.bodyRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { marginTop: 20 }]}>키 (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 165"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={height}
                  onChangeText={setHeight}
                  maxLength={3}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { marginTop: 20 }]}>몸무게 (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="예: 60"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={weight}
                  onChangeText={setWeight}
                  maxLength={3}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>성별</Text>
            <View style={styles.genderRow}>
              {(
                [
                  { key: "male", label: "남성", emoji: "🙋🏻‍♂️" },
                  { key: "female", label: "여성", emoji: "🙋🏻‍♀️" },
                ] as const
              ).map((g) => (
                <TouchableOpacity
                  key={g.key}
                  style={[
                    styles.genderButton,
                    gender === g.key && styles.genderSelected,
                  ]}
                  onPress={() => setGender(g.key)}
                >
                  <Text style={styles.genderEmoji}>{g.emoji}</Text>
                  <Text style={[
                    styles.genderLabel,
                    gender === g.key && styles.genderLabelSelected,
                  ]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.ctaButton,
              (!nickname.trim() || !age || !gender) && styles.ctaDisabled,
            ]}
            onPress={handleProfileDone}
            disabled={!nickname.trim() || !age || !gender}
          >
            <Text style={styles.ctaText}>⚡ 진단 시작하기</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            본 앱은 의료적 진단이 아닌 건강 관리 목적으로 제공됩니다.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Designed by </Text>
            <TouchableOpacity onPress={() => Linking.openURL("https://nugunaai.com/")}>
              <Text style={styles.footerLink}>NuGuNaAi Ellie</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── 로딩 단계 ──
  if (step === "loading") {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <Text style={styles.loadingEmoji}>
          {LOADING_EMOJIS[currentLoadingEmoji]}
        </Text>
        <Text style={styles.loadingText}>
          AI가 맞춤 운동 프로그램을{"\n"}만들고 있어요...
        </Text>
        <View style={styles.loadingSteps}>
          <Text style={styles.loadingStep}>✅ 체크리스트 분석 완료</Text>
          <Text style={styles.loadingStep}>⏳ FITT-VP 처방 산출 중...</Text>
          <Text style={styles.loadingStepPending}>⬜ YouTube 영상 큐레이션</Text>
        </View>
        <ActivityIndicator
          size="small"
          color={COLORS.electricBlue}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  // ── 체크리스트 단계 ──
  const currentQuestion = questions[currentQ];
  if (!currentQuestion) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.electricBlue} />
        <Text style={styles.loadingText}>질문을 불러오는 중...</Text>
      </View>
    );
  }

  const motivation = getMotivation();

  return (
    <View style={styles.screen}>
      <View style={styles.checklistHeader}>
        {currentQ > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← 이전</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
        <Text style={styles.headerTitle}>라이프스타일 진단</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 동기부여 문구 배너 */}
      {motivation && (
        <View style={styles.motivationBanner}>
          <Text style={styles.motivationEmoji}>{motivation.emoji}</Text>
          <Text style={styles.motivationText}>{motivation.text}</Text>
        </View>
      )}

      <View style={styles.cardWrapper}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ChecklistCard
            question={currentQuestion}
            currentIndex={currentQ}
            totalCount={questions.length}
            selectedValue={answers[currentQuestion.id] ?? null}
            onSelect={handleSelect}
          />
        </Animated.View>
      </View>

      <View style={styles.footerChecklist}>
        <Text style={styles.footerText}>Designed by </Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://nugunaai.com/")}>
          <Text style={styles.footerLink}>NuGuNaAi Ellie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // 프로필
  profileContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileHeroEmojis: {
    alignItems: "center",
    marginBottom: 12,
  },
  heroEmojiText: {
    fontSize: 36,
    letterSpacing: 8,
  },
  logo: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.deepNavy,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 36,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  bodyRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.bg,
  },
  genderRow: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  genderSelected: {
    borderColor: COLORS.electricBlue,
    backgroundColor: "rgba(59,130,246,0.06)",
  },
  genderEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  genderLabelSelected: {
    color: COLORS.electricBlue,
    fontWeight: "700",
  },
  ctaButton: {
    backgroundColor: COLORS.electricBlue,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.electricBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 5 },
    }),
  },
  ctaDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
  },
  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 16,
  },
  // 체크리스트
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  backButton: { width: 60 },
  backText: {
    fontSize: 15,
    color: COLORS.electricBlue,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  motivationBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: "rgba(59,130,246,0.06)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.electricBlue,
  },
  motivationEmoji: { fontSize: 18, marginRight: 10 },
  motivationText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.electricBlue,
    flex: 1,
  },
  cardWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  // 로딩
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingEmoji: { fontSize: 56, marginBottom: 16 },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.deepNavy,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 28,
  },
  loadingSteps: {
    marginTop: 24,
    alignItems: "flex-start",
  },
  loadingStep: {
    fontSize: 14,
    color: COLORS.emerald,
    fontWeight: "600",
    marginBottom: 8,
  },
  loadingStepPending: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerChecklist: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.emerald,
    textDecorationLine: "underline",
  },
});
