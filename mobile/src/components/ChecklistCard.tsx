/**
 * 체크리스트 진단 질문 카드 컴포넌트 (Commercial UX)
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy / Electric Blue / Emerald 컬러 통일
 * - 프리미엄 카드 + Glassmorphism 느낌
 * - 카테고리별 컬러 시스템 유지 (시각적 구분)
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import type { ChecklistQuestion } from "../types";

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

// 카테고리별 아이콘과 액센트 컬러
const CATEGORY_STYLE: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  physical_activity: { emoji: "🏃‍♂️", label: "신체활동", color: "#3B82F6" },
  diet: { emoji: "🥗", label: "식습관", color: "#10B981" },
  sleep: { emoji: "🌙", label: "수면", color: "#7C3AED" },
  stress: { emoji: "🧘‍♀️", label: "스트레스", color: "#F59E0B" },
  health_status: { emoji: "❤️", label: "건강상태", color: "#EF4444" },
  exercise_experience: { emoji: "💪", label: "운동경험", color: "#F97316" },
};

interface Props {
  question: ChecklistQuestion;
  currentIndex: number;
  totalCount: number;
  selectedValue: number | null;
  onSelect: (value: number) => void;
}

export default function ChecklistCard({
  question,
  currentIndex,
  totalCount,
  selectedValue,
  onSelect,
}: Props) {
  const catStyle = CATEGORY_STYLE[question.category] || {
    emoji: "📋",
    label: question.category,
    color: COLORS.electricBlue,
  };

  const progress = ((currentIndex + 1) / totalCount) * 100;

  return (
    <View style={styles.container}>
      {/* 카테고리 배지 + 진행 카운터 */}
      <View style={styles.progressRow}>
        <View style={[styles.categoryBadge, { backgroundColor: catStyle.color + "12" }]}>
          <Text style={styles.categoryEmoji}>{catStyle.emoji}</Text>
          <Text style={[styles.categoryLabel, { color: catStyle.color }]}>
            {catStyle.label}
          </Text>
        </View>
        <Text style={styles.counter}>
          {currentIndex + 1} / {totalCount}
        </Text>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${progress}%`, backgroundColor: catStyle.color },
          ]}
        />
      </View>

      {/* 질문 텍스트 */}
      <Text style={styles.questionText}>{question.text}</Text>

      {/* 선택지 버튼 */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const value = index + 1;
          const isSelected = selectedValue === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionButton,
                isSelected && {
                  borderColor: catStyle.color,
                  backgroundColor: catStyle.color + "08",
                },
              ]}
              onPress={() => onSelect(value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionRow}>
                <View style={[
                  styles.radioCircle,
                  isSelected && { borderColor: catStyle.color },
                ]}>
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: catStyle.color }]} />
                  )}
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && { fontWeight: "700", color: catStyle.color },
                ]}>
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 하단 응원 텍스트 */}
      {progress >= 50 && (
        <Text style={styles.cheerText}>
          {progress >= 90
            ? "🔥 거의 다 왔어요! 마지막 스퍼트!"
            : progress >= 70
            ? "💪 절반 넘었어요! 힘내세요!"
            : "👍 잘하고 있어요!"}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryEmoji: { fontSize: 14, marginRight: 6 },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  counter: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.deepNavy,
    lineHeight: 30,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bg,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  cheerText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.emerald,
    marginTop: 16,
  },
});
