/**
 * 체크리스트 진단 질문 카드 컴포넌트
 *
 * 한 번에 하나의 질문을 카드 형태로 보여주고
 * 5점 리커트 척도 버튼으로 답변을 받습니다.
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
  // 카테고리 한글 라벨
  const categoryLabels: Record<string, string> = {
    physical_activity: "신체활동",
    diet: "식습관",
    sleep: "수면",
    stress: "스트레스",
    health_status: "건강상태",
    exercise_experience: "운동경험",
  };

  return (
    <View style={styles.container}>
      {/* 진행 상태 */}
      <View style={styles.progressRow}>
        <Text style={styles.category}>
          {categoryLabels[question.category] || question.category}
        </Text>
        <Text style={styles.counter}>
          {currentIndex + 1} / {totalCount}
        </Text>
      </View>

      {/* 프로그레스 바 */}
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${((currentIndex + 1) / totalCount) * 100}%` },
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
              style={[styles.optionButton, isSelected && styles.optionSelected]}
              onPress={() => onSelect(value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: 8,
  },
  category: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
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
    backgroundColor: COLORS.primary,
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
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: "#EBF3FB",
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
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: COLORS.primary,
  },
});
