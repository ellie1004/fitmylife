/**
 * YouTube 영상 재생 스크린 (Commercial UX)
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy / Electric Blue / Emerald 컬러 팔레트
 * - 프리미엄 카드 + 강화된 그림자
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import YouTubePlayer from "../components/YouTubePlayer";
import { useWorkoutStore } from "../stores/workoutStore";
import type { VideoItem } from "../types";

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

export default function VideoPlayerScreen({ videoId, onBack, onSelectVideo }: Props) {
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
              <Text style={styles.meta}>{formatViews(current.view_count)}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.meta}>{formatDuration(current.duration_seconds)}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 50 },
  backText: {
    fontSize: 15,
    color: COLORS.electricBlue,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  content: {
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  videoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.deepNavy,
    lineHeight: 26,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  channel: {
    fontSize: 13,
    color: COLORS.electricBlue,
    fontWeight: "700",
  },
  dot: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: 5,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  scoreChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(16,185,129,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scoreChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.emerald,
  },
  nextSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  nextTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.deepNavy,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  nextItem: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  nextThumb: {
    width: 120,
    height: 72,
    backgroundColor: COLORS.border,
  },
  nextInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  nextVideoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  nextChannel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
});
