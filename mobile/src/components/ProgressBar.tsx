/**
 * 원형 프로그레스 바 컴포넌트
 *
 * 체크리스트 결과의 영역별 점수를 시각적으로 보여줍니다.
 * SVG 없이 순수 View rotation으로 원형 게이지를 구현합니다.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  warning: "#FF9800",
  danger: "#EF4444",
  bg: "#E5E7EB",
};

interface Props {
  label: string;
  value: number; // 0~100
  size?: number;
}

/** 점수에 따른 색상 반환 */
function getColor(value: number): string {
  if (value >= 70) return COLORS.accent;
  if (value >= 40) return COLORS.warning;
  return COLORS.danger;
}

export default function ProgressBar({ label, value, size = 80 }: Props) {
  const color = getColor(value);
  return (
    <View style={styles.container}>
      {/* 원형 게이지 (간단한 보더 방식) */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: COLORS.bg,
          },
        ]}
      >
        <View
          style={[
            styles.circleInner,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
            },
          ]}
        >
          <Text style={[styles.valueText, { color, fontSize: size * 0.25 }]}>
            {Math.round(value)}
          </Text>
        </View>
        {/* 색상 보더 오버레이 */}
        <View
          style={[
            styles.colorBorder,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: color,
              borderTopColor: value >= 25 ? color : "transparent",
              borderRightColor: value >= 50 ? color : "transparent",
              borderBottomColor: value >= 75 ? color : "transparent",
              borderLeftColor: value >= 100 ? color : "transparent",
            },
          ]}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  circle: {
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circleInner: {
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  colorBorder: {
    position: "absolute",
    borderWidth: 4,
  },
  valueText: {
    fontWeight: "800",
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
  },
});
