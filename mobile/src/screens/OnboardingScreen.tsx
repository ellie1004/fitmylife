/**
 * 온보딩 & 체크리스트 진단 스크린
 *
 * 1) 사용자 기본 정보 입력 (나이, 성별)
 * 2) 18개 체크리스트 질문에 순차 응답
 * 3) 완료 시 운동처방 생성 → HomeScreen으로 이동
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
} from "react-native";
import ChecklistCard from "../components/ChecklistCard";
import { fetchQuestions, generatePrescription } from "../services/api";
import { useUserStore } from "../stores/userStore";
import { useWorkoutStore } from "../stores/workoutStore";
import type { ChecklistQuestion, ChecklistAnswer } from "../types";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  warning: "#FF9800",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
};

interface Props {
  onComplete: () => void;
}

type Step = "profile" | "checklist" | "loading";

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>("profile");

  // 프로필 입력
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);

  // 체크리스트
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // 애니메이션
  const fadeAnim = useState(new Animated.Value(1))[0];

  const { setProfile } = useUserStore();
  const { setWorkoutPlan, setChecklistResult } = useWorkoutStore();

  // 질문 목록 미리 로드
  useEffect(() => {
    fetchQuestions()
      .then(setQuestions)
      .catch(() => {
        // 오프라인 폴백: 빈 질문 → 기본 처방
      });
  }, []);

  // 카드 전환 애니메이션
  const animateTransition = (callback: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // 프로필 완료 → 체크리스트 시작
  const handleProfileDone = () => {
    if (!age || !gender) return;
    setProfile({ age: parseInt(age), gender });
    setStep("checklist");
  };

  // 질문 답변 선택
  const handleSelect = (value: number) => {
    const q = questions[currentQ];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    // 0.4초 후 자동 다음 질문
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        animateTransition(() => setCurrentQ(currentQ + 1));
      } else {
        // 마지막 질문 → 처방 생성
        handleSubmit(newAnswers);
      }
    }, 400);
  };

  // 이전 질문
  const handleBack = () => {
    if (currentQ > 0) {
      animateTransition(() => setCurrentQ(currentQ - 1));
    }
  };

  // 체크리스트 제출 & 운동처방 생성
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
      // 네트워크 오류 시 기본 처방으로 폴백
      console.warn("처방 생성 실패:", err);
      setStep("checklist");
    }
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
          <Text style={styles.logo}>FitMyLife</Text>
          <Text style={styles.subtitle}>
            나에게 딱 맞는 운동을 찾아볼까요?
          </Text>

          <View style={styles.profileCard}>
            <Text style={styles.inputLabel}>나이</Text>
            <TextInput
              style={styles.input}
              placeholder="예: 28"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              maxLength={3}
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>성별</Text>
            <View style={styles.genderRow}>
              {(
                [
                  { key: "male", label: "남성", emoji: "🙋‍♂️" },
                  { key: "female", label: "여성", emoji: "🙋‍♀️" },
                  { key: "other", label: "기타", emoji: "🧑" },
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
                  <Text
                    style={[
                      styles.genderLabel,
                      gender === g.key && styles.genderLabelSelected,
                    ]}
                  >
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.ctaButton,
              (!age || !gender) && styles.ctaDisabled,
            ]}
            onPress={handleProfileDone}
            disabled={!age || !gender}
          >
            <Text style={styles.ctaText}>진단 시작하기</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            본 앱은 의료적 진단이 아닌 건강 관리 목적으로 제공됩니다.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── 로딩 단계 ──
  if (step === "loading") {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          AI가 맞춤 운동 프로그램을{"\n"}만들고 있어요...
        </Text>
        <Text style={styles.loadingSubtext}>
          체크리스트 분석 중 → FITT-VP 산출 중 → 영상 큐레이션 중
        </Text>
      </View>
    );
  }

  // ── 체크리스트 단계 ──
  const currentQuestion = questions[currentQ];
  if (!currentQuestion) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>질문을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.checklistHeader}>
        {currentQ > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← 이전</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>라이프스타일 진단</Text>
        <View style={{ width: 60 }} />
      </View>

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
  logo: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 36,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
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
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: COLORS.bg,
  },
  genderSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EBF3FB",
  },
  genderEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  genderLabelSelected: {
    color: COLORS.primary,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaDisabled: {
    backgroundColor: "#B0C4DE",
    shadowOpacity: 0,
  },
  ctaText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },
  disclaimer: {
    fontSize: 11,
    color: "#9CA3AF",
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
    paddingBottom: 12,
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
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
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 28,
  },
  loadingSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: 12,
  },
});
