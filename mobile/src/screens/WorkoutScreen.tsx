/**
 * 오늘의 운동 스크린 (Commercial UX)
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy 헤더 + Electric Blue 액센트
 * - 프리미엄 배너 디자인 + 강화된 그림자
 */

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import WorkoutCard from "../components/WorkoutCard";
import { useWorkoutStore } from "../stores/workoutStore";
import type { VideoItem } from "../types";

const COLORS = {
  deepNavy: "#0F172A",
  electricBlue: "#3B82F6",
  emerald: "#10B981",
  warning: "#F59E0B",
  bg: "#F8FAFC",
  text: "#0F172A",
  textSecondary: "#64748B",
};

const INTENSITY_LABEL: Record<string, string> = {
  low: "저강도",
  moderate: "중강도",
  high: "고강도",
};

interface Props {
  onSelectVideo: (videoId: string) => void;
  onBack: () => void;
  targetVideos?: VideoItem[] | null;
  targetAreaLabel?: string;
}

export default function WorkoutScreen({ onSelectVideo, onBack, targetVideos, targetAreaLabel }: Props) {
  const { workoutPlan } = useWorkoutStore();
  const isTargetMode = targetVideos && targetVideos.length > 0;

  if (!isTargetMode && !workoutPlan) return null;

  const fitt = workoutPlan?.fitt;
  const videos = isTargetMode ? targetVideos : workoutPlan!.videos;
  const target_area = isTargetMode ? targetAreaLabel : workoutPlan!.target_area;

  const renderVideo = ({ item, index }: { item: VideoItem; index: number }) => (
    <WorkoutCard video={item} index={index} onPress={onSelectVideo} />
  );

  return (
    <View style={styles.screen}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 홈</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isTargetMode ? "고민 부위 운동" : "오늘의 운동"}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {/* 운동 요약 배너 */}
      <View style={[styles.banner, isTargetMode && styles.bannerTarget]}>
        <View style={styles.bannerRow}>
          {!isTargetMode && fitt && (
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>
                {INTENSITY_LABEL[fitt.intensity]}
              </Text>
            </View>
          )}
          {isTargetMode && (
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>🎯 집중 운동</Text>
            </View>
          )}
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>{target_area}</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtext}>
          {isTargetMode
            ? "선택한 부위에 맞는 영상을 준비했어요!"
            : "아래 영상을 순서대로 따라해보세요"}
        </Text>
      </View>

      {/* 영상 리스트 */}
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.video_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
  },
  backBtn: { width: 50 },
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
  banner: {
    marginHorizontal: 16,
    backgroundColor: COLORS.deepNavy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  bannerTarget: {
    backgroundColor: COLORS.warning,
  },
  bannerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  bannerTag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bannerTagText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  bannerSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
