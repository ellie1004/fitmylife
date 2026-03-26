/**
 * 체크리스트 진단 질문 카드 컴포넌트
 *
 * 한 번에 하나의 질문을 카드 형태로 보여주고
 * 5점 리커트 척도 버튼으로 답변을 받습니다.
 * 카테고리별 운동 관련 아이콘 장식 포함.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { ChecklistQuestion } from "../types";

// 메인 컬러 팔레트 (CLAUDE.md 기준)
const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  warning: "#FF9800",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
  selected: "#2E75B6",
  selectedText: "#FFFFFF",
};

// 카테고리별 아이콘과 액센트 컬러
const CATEGORY_STYLE: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  physical_activity: { emoji: "🏃‍♂️", label: "신체활동", color: "#2E75B6" },
  diet: { emoji: "🥗", label: "식습관", color: "#4CAF50" },
  sleep: { emoji: "🌙", label: "수면", color: "#7C3AED" },
  stress: { emoji: "🧘‍♀️", label: "스트레스", color: "#F59E0B" },
  health_status: { emoji: "❤️", label: "건강상태", color: "#EF4444" },
  exercise_experience: { emoji: "💪", label: "운동경험", color: "#FF9800" },
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
    color: COLORS.primary,
  };

  const progress = ((currentIndex + 1) / totalCount) * 100;

  return (
    <View style={styles.container}>
      {/* 카테고리 배지 + 진행 카운터 */}
      <View style={styles.progressRow}>
        <View
          style={[styles.categoryBadge, { backgroundColor: catStyle.color + "15" }]}
        >
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
            {
              width: `${progress}%`,
              backgroundColor: catStyle.color,
            },
          ]}
        />
      </View>

      {/* 질문 텍스트 */}
      <Text style={styles.questionText}>{question.text}</Text>

      {/* 선택지 버튼 */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const value = index + 1; // 1~5점
          const isSelected = selectedValue === value;
          return (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionButton,
                isSelected && {
                  borderColor: catStyle.color,
                  backgroundColor: catStyle.color + "10",
                },
              ]}
              onPress={() => onSelect(value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && { borderColor: catStyle.color },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: catStyle.color },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && {
                      fontWeight: "600",
                      color: catStyle.color,
                    },
                  ]}
                >
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
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
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  counter: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "#E5E7EB",
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
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 30,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
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
    borderColor: "#D1D5DB",
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
    fontWeight: "600",
    color: COLORS.accent,
    marginTop: 16,
  },
});
