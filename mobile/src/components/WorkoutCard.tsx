/**
 * 운동 추천 카드 (YouTube 영상)
 *
 * 썸네일, 제목, 채널명, 영상 길이, 스코어를 보여주며
 * 탭하면 VideoPlayerScreen으로 이동합니다.
 */

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import type { VideoItem } from "../types";

const COLORS = {
  primary: "#2E75B6",
  accent: "#4CAF50",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
  bg: "#F5F7FA",
};

interface Props {
  video: VideoItem;
  index: number;
  onPress: (videoId: string) => void;
}

/** 초를 "M:SS" 형식으로 변환 */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** 조회수를 축약 표시 (예: 1.2만) */
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailWrap: {
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: "#E5E7EB",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  indexBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  indexText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  channel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  dot: {
    fontSize: 12,
    color: COLORS.textLight,
    marginHorizontal: 4,
  },
  views: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginRight: 8,
    fontWeight: "500",
  },
  scoreBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accent,
    marginLeft: 8,
    minWidth: 24,
    textAlign: "right",
  },
});
