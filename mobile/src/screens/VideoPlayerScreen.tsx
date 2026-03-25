/**
 * YouTube 영상 재생 스크린
 *
 * 선택한 영상을 앱 내 WebView로 임베드 재생합니다.
 * 영상 정보(제목, 채널, 조회수)와 다음 영상 미리보기를 제공합니다.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import YouTubePlayer from "../components/YouTubePlayer";
import { useWorkoutStore } from "../stores/workoutStore";
import type { VideoItem } from "../types";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

function formatViews(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만회`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천회`;
  return `${count}회`;
}

interface Props {
  videoId: string;
  onBack: () => void;
  onSelectVideo: (videoId: string) => void;
}

export default function VideoPlayerScreen({
  videoId,
  onBack,
  onSelectVideo,
}: Props) {
  const { workoutPlan } = useWorkoutStore();
  if (!workoutPlan) return null;

  const { videos } = workoutPlan;
  const currentIndex = videos.findIndex((v) => v.video_id === videoId);
  const current = videos[currentIndex];
  const nextVideos = videos.filter((v) => v.video_id !== videoId);

  return (
    <View style={styles.screen}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 목록</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentIndex + 1} / {videos.length}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* YouTube 플레이어 */}
        <YouTubePlayer videoId={videoId} />

        {/* 영상 정보 */}
        {current && (
          <View style={styles.infoCard}>
            <Text style={styles.videoTitle}>{current.title}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.channel}>{current.channel_title}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>
                {formatViews(current.view_count)}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>
                {formatDuration(current.duration_seconds)}
              </Text>
            </View>
            <View style={styles.scoreChip}>
              <Text style={styles.scoreChipText}>
                매칭도 {current.score.toFixed(0)}점
              </Text>
            </View>
          </View>
        )}

        {/* 다음 영상 */}
        {nextVideos.length > 0 && (
          <View style={styles.nextSection}>
            <Text style={styles.nextTitle}>다음 영상</Text>
            {nextVideos.map((v) => (
              <TouchableOpacity
                key={v.video_id}
                style={styles.nextItem}
                onPress={() => onSelectVideo(v.video_id)}
              >
                <Image
                  source={{ uri: v.thumbnail_url }}
                  style={styles.nextThumb}
                />
                <View style={styles.nextInfo}>
                  <Text style={styles.nextVideoTitle} numberOfLines={2}>
                    {v.title}
                  </Text>
                  <Text style={styles.nextChannel}>{v.channel_title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: COLORS.card,
  },
  backBtn: { width: 50 },
  backText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  content: {
    paddingBottom: 40,
  },
  // 영상 정보
  infoCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  videoTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  channel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  dot: {
    fontSize: 13,
    color: COLORS.textLight,
    marginHorizontal: 5,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  scoreChip: {
    alignSelf: "flex-start",
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },
  // 다음 영상
  nextSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  nextItem: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  nextThumb: {
    width: 120,
    height: 72,
    backgroundColor: "#E5E7EB",
  },
  nextInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  nextVideoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  nextChannel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
