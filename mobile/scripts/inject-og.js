/**
 * OG 메타 태그 주입 스크립트
 *
 * Expo 웹 빌드 후 dist/index.html에 Open Graph 메타 태그를 삽입합니다.
 * 카카오톡, 페이스북, 트위터 등에서 링크 공유 시 예쁜 미리보기가 표시됩니다.
 */

const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(indexPath, "utf-8");

const ogTags = `
    <title>FitMyLife - AI 맞춤 운동처방</title>
    <meta name="description" content="AI가 분석하는 나만의 맞춤 운동 프로그램. 3분 체크리스트로 나의 운동 처방전 받기!" />
    <meta name="theme-color" content="#0F172A" />

    <!-- Open Graph (카카오톡, 페이스북 등) -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="FitMyLife - AI 맞춤 운동처방" />
    <meta property="og:description" content="3분 체크리스트로 나만의 맞춤 운동 프로그램을 받아보세요! AI가 분석하고, YouTube 영상까지 큐레이션해드려요." />
    <meta property="og:image" content="https://fitmylife.vercel.app/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:site_name" content="FitMyLife" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="FitMyLife - AI 맞춤 운동처방" />
    <meta name="twitter:description" content="3분 체크리스트로 나만의 맞춤 운동 프로그램을 받아보세요!" />
    <meta name="twitter:image" content="https://fitmylife.vercel.app/og-image.png" />
`;

// 기존 <title> 태그 교체
html = html.replace(/<title>.*?<\/title>/, "");

// </head> 직전에 OG 태그 삽입
html = html.replace("</head>", ogTags + "\n  </head>");

// lang 속성을 ko로 변경
html = html.replace('lang="en"', 'lang="ko"');

fs.writeFileSync(indexPath, html, "utf-8");
console.log("✅ OG meta tags injected into dist/index.html");
