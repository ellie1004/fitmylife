/**
 * 오늘의 운동 스크린
 *
 * FITT 처방에 맞게 큐레이션된 YouTube 영상 리스트를 보여줍니다.
 * 영상 카드를 탭하면 VideoPlayerScreen으로 이동합니다.
 */

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import WorkoutCard from "../components/WorkoutCard";
import { useWorkoutStore } from "../stores/workoutStore";
import type { VideoItem } from "../types";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  bg: "#F5F7FA",
  text: "#1A1A2E",
  textLight: "#6B7280",
};

const INTENSITY_LABEL: Record<string, string> = {
  low: "저강도",
  moderate: "중강도",
  high: "고강도",
};

interface Props {
  onSelectVideo: (videoId: string) => void;
  onBack: () => void;
  // 고민 부위 운동용 — 전달되면 FITT 처방 대신 이 영상을 보여줌
  targetVideos?: VideoItem[] | null;
  targetAreaLabel?: string;
}

export default function WorkoutScreen({ onSelectVideo, onBack, targetVideos, targetAreaLabel }: Props) {
  const { workoutPlan } = useWorkoutStore();

  // 고민 부위 운동 모드인지 판별
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
      <View style={[styles.banner, isTargetMode && { backgroundColor: "#FF9800" }]}>
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
  },
  backBtn: {
    width: 50,
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
  banner: {
    marginHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  bannerRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  bannerTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bannerTagText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bannerSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
});
