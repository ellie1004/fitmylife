/**
 * 운동 추천 카드 (YouTube 영상) — Commercial UX
 *
 * CLAUDE_PRO_SPEC 기반:
 * - Deep Navy / Electric Blue / Emerald 컬러 통일
 * - 프리미엄 카드 그림자 + 세밀한 타이포그래피
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import type { VideoItem } from "../types";

const COLORS = {
  deepNavy: "#0F172A",
  electricBlue: "#3B82F6",
  emerald: "#10B981",
  card: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  bg: "#F8FAFC",
  border: "#E2E8F0",
};

interface Props {
  video: VideoItem;
  index: number;
  onPress: (videoId: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatViews(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
  return count.toString();
}

export default function WorkoutCard({ video, index, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(video.video_id)}
      activeOpacity={0.85}
    >
      {/* 썸네일 + 영상 길이 뱃지 */}
      <View style={styles.thumbnailWrap}>
        <Image
          source={{ uri: video.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(video.duration_seconds)}
          </Text>
        </View>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
      </View>

      {/* 영상 정보 */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.channel}>{video.channel_title}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.views}>조회수 {formatViews(video.view_count)}</Text>
        </View>
        {/* 매칭 스코어 바 */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>매칭도</Text>
          <View style={styles.scoreBarBg}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${Math.min(video.score, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.scoreValue}>{video.score.toFixed(0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: { shadowColor: COLORS.deepNavy, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },
  thumbnailWrap: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.border,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  indexBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.electricBlue,
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: COLORS.electricBlue, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  indexText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.deepNavy,
    lineHeight: 22,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  channel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  dot: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  views: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: 8,
    fontWeight: "600",
  },
  scoreBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: COLORS.emerald,
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.emerald,
    marginLeft: 8,
    minWidth: 24,
    textAlign: "right",
  },
});
