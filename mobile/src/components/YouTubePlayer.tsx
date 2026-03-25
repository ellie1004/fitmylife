/**
 * YouTube 임베드 플레이어 컴포넌트
 *
 * WebView를 사용하여 YouTube 영상을 앱 내에서 재생합니다.
 * YouTube IFrame API를 활용합니다.
 */

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PLAYER_HEIGHT = (SCREEN_WIDTH - 32) * (9 / 16); // 16:9 비율

interface Props {
  videoId: string;
}

export default function YouTubePlayer({ videoId }: Props) {
  // YouTube IFrame embed HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; }
        body { background: #000; }
        iframe { width: 100%; height: 100vh; border: none; }
      </style>
    </head>
    <body>
      <iframe
        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
    height: PLAYER_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    alignSelf: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
});
