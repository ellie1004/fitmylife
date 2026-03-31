/**
 * 웰컴 스크린 — 프리미엄 브랜딩 랜딩
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy 배경 + Electric Blue & Emerald 액센트
 * - 강렬한 CTA + 프리미엄 타이포그래피
 * - 피트니스 무드보드 배경 + 부드러운 애니메이션
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Linking,
  Platform,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  deepNavy: "#0F172A",
  electricBlue: "#3B82F6",
  emerald: "#10B981",
  white: "#FFFFFF",
  muted: "#94A3B8",
};

interface Props {
  onStart: () => void;
}

// 피트니스 아이콘 그리드 — 배경 장식 요소
const FITNESS_ICONS = [
  "🏋️", "🧘‍♀️", "🏃‍♂️", "💪", "🤸‍♀️",
  "⚡", "🔥", "🎯", "❤️‍🔥", "🏆",
  "🥊", "🚴‍♀️", "⏱️", "🫁", "✨",
  "🧗‍♂️", "🏊‍♀️", "🤾‍♀️", "🎽", "💥",
];

export default function WelcomeScreen({ onStart }: Props) {
  const fadeMain = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const fadeCTA = useRef(new Animated.Value(0)).current;
  const scaleCTA = useRef(new Animated.Value(0.9)).current;
  const fadeIcons = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIcons, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeMain, {
          toValue: 1, duration: 500, useNativeDriver: true,
        }),
        Animated.timing(slideUp, {
          toValue: 0, duration: 500, useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeCTA, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.spring(scaleCTA, {
          toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04, duration: 1200, useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, duration: 1200, useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* 배경 피트니스 아이콘 그리드 */}
      <Animated.View style={[styles.iconGrid, { opacity: fadeIcons }]}>
        {FITNESS_ICONS.map((icon, i) => (
          <View key={i} style={styles.iconCell}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        ))}
      </Animated.View>

      {/* 다크 오버레이 */}
      <View style={styles.overlay} />

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {/* 상단 로고 영역 */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeMain, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Text style={styles.tagline}>YOUR FITNESS JOURNEY</Text>
          <Text style={styles.logo}>FitMyLife</Text>
          <View style={styles.divider} />
          <Text style={styles.heroText}>
            AI가 분석하는{"\n"}
            나만의 맞춤 운동 프로그램
          </Text>
          <Text style={styles.heroSub}>
            간단한 라이프스타일 체크리스트로{"\n"}
            당신에게 딱 맞는 운동을 찾아드려요
          </Text>
        </Animated.View>

        {/* 미션 강조 배지 */}
        <Animated.View
          style={[
            styles.missionBadge,
            { opacity: fadeMain, transform: [{ translateY: slideUp }] },
          ]}
        >
          <Text style={styles.missionIcon}>🎯</Text>
          <View style={styles.missionTextWrap}>
            <Text style={styles.missionTitle}>FIRST MISSION</Text>
            <Text style={styles.missionDesc}>
              3분 체크리스트로 나의 운동 처방전 받기
            </Text>
          </View>
        </Animated.View>

        {/* CTA 버튼 */}
        <Animated.View
          style={[
            styles.ctaWrap,
            { opacity: fadeCTA, transform: [{ scale: Animated.multiply(scaleCTA, pulseAnim) }] },
          ]}
        >
          <TouchableOpacity style={styles.ctaButton} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.ctaEmoji}>⚡</Text>
            <Text style={styles.ctaText}>체크리스트 START!</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 하단 피쳐 아이콘 */}
        <Animated.View style={[styles.features, { opacity: fadeCTA }]}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureLabel}>맞춤 진단</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureLabel}>AI 처방</Text>
          </View>
          <View style={styles.featureDot} />
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎬</Text>
            <Text style={styles.featureLabel}>영상 큐레이션</Text>
          </View>
        </Animated.View>

        {/* 하단 크레딧 */}
        <Animated.View style={[styles.footer, { opacity: fadeCTA }]}>
          <Text style={styles.footerText}>Designed by </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://nugunaai.com/")}>
            <Text style={styles.footerLink}>NuGuNaAi Ellie</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepNavy,
  },
  iconGrid: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    paddingTop: 60,
    opacity: 0.12,
  },
  iconCell: {
    width: width / 5,
    height: width / 5,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: { fontSize: 32 },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.electricBlue,
    letterSpacing: 4,
    marginBottom: 12,
  },
  logo: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 16,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.electricBlue,
    borderRadius: 2,
    marginBottom: 20,
  },
  heroText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  missionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.25)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 36,
    width: "100%",
  },
  missionIcon: { fontSize: 28, marginRight: 14 },
  missionTextWrap: { flex: 1 },
  missionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.electricBlue,
    letterSpacing: 2,
    marginBottom: 4,
  },
  missionDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  ctaWrap: {
    width: "100%",
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.electricBlue,
    borderRadius: 18,
    paddingVertical: 20,
    ...Platform.select({
      ios: { shadowColor: COLORS.electricBlue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  ctaEmoji: { fontSize: 22, marginRight: 10 },
  ctaText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  features: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  featureItem: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  featureIcon: { fontSize: 20, marginBottom: 4 },
  featureLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.muted,
  },
  featureDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  footerLink: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(59,130,246,0.6)",
    textDecorationLine: "underline",
  },
});
