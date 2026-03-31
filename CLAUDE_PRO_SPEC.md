CLAUDE_COMMERCIAL_UPGRADE.md
## 1. Design System & Branding (High-End UX)

상업용 서비스는 시각적 완성도가 곧 신뢰입니다. AI는 다음 디자인 원칙을 모든 컴포넌트에 적용해야 합니다.

Color Palette:

Primary: Deep Navy (#0F172A) & Electric Blue (#3B82F6) - 전문성과 신뢰감 강조.

Accent: Emerald Green (#10B981) - 건강과 성취감 상징.

Typography: 'Pretendard' 또는 'Inter' 사용. 자간(tracking-tight)과 행간을 조절하여 가독성 최적화.

Micro-Interactions: 모든 클릭 가능한 요소에는 framer-motion을 이용한 부드러운 Scale 효과나 Hover 상태 반영 필수.

Glassmorphism: 대시보드 카드에 미세한 투명도와 블러(backdrop-blur-md)를 적용하여 모던한 레이어감 생성.

## 2. UX Optimization Strategies

AI는 코드를 작성할 때 사용자의 여정(User Journey)을 다음과 같이 개선해야 합니다.

Zero-Friction Onboarding: 복잡한 가입 절차 대신, 소셜 로그인(Kakao, Google) 후 3초 내에 첫 번째 건강 대시보드를 볼 수 있도록 설계.

Progressive Disclosure: 정보 과부하를 방지하기 위해 중요 정보만 먼저 노출하고, 세부 데이터는 아코디언이나 모달을 통해 단계적으로 공개.

Empty State Management: 데이터가 없는 초기 상태에서도 사용자가 무엇을 해야 할지 알 수 있도록 가이드 UI(Cta Button) 배치.

Skeleton Screens: 데이터 로딩 시 단순한 스피너 대신 콘텐츠 구조를 미리 보여주는 Skeleton UI 적용으로 체감 속도 향상.

## 3. Core Technical Upgrade (SEO & Conversion)

상업적 성공을 위한 마케팅 및 기술적 장치를 코드에 심어야 합니다.

SEO & Answer Engine Optimization (AEO):

JSON-LD 구조화 데이터 삽입: 서비스의 FAQ, Review, Product 정보를 검색 엔진이 이해하기 쉽게 설정.

Semantic HTML: section, article, nav, header 태그를 엄격히 구분하여 사용.

Conversion Rate Optimization (CRO):

Sticky CTA: 스크롤 시에도 주요 버튼(예: 구독하기, 시작하기)이 화면 하단이나 상단에 고정되도록 구현.

A/B Testing Ready: UI 컴포넌트가 props에 따라 다른 레이아웃을 렌더링할 수 있도록 유연하게 설계.

## 4. Modular Folder Structure (Scalable)

Plaintext
src/
├── components/
│   ├── design-system/    # Typography, Buttons, Inputs (Atomic)
│   ├── layout/           # Global Navigation, Footer, Sidebar
│   ├── dashboard/        # Complex data visualization units
│   └── shared/           # Modals, Toasts, Skeletons
├── modules/              # Domain-specific logic (e.g., Diet, Workout)
├── lib/
│   ├── supabase/         # DB & Auth client
│   ├── utils/            # cn(), formatting, validators
│   └── seo/              # Structured data generators
## 5. Instructions for AI Developer (Claude Code)

Role: 당신은 단순 개발자가 아닌, "성공하는 서비스를 만드는 Product Engineer"입니다.

UI Consistency: 모든 컴포넌트는 Tailwind CSS와 Shadcn UI를 베이스로 하되, FitMyLife만의 커스텀 테마를 적용하라.

Accessibility (A11y): 웹 접근성 표준을 준수하여 키보드 내비게이션과 스크린 리더 호환성을 확보하라.

Data Visualization: 건강 데이터는 Recharts 등을 사용하여 시각적으로 화려하면서도 직관적인 그래프로 표현하라.

Performance: Next.js의 Server Components를 적극 활용하여 클라이언트 사이드 JS 번들 사이즈를 최소화하라.

Direct Directive: "기능만 작동하게 만들지 마세요. 사용자가 '아름답다'고 느낄 수 있는 인터페이스와 부드러운 트랜지션을 함께 구현하세요."

## 6. Immediate Task List

Landing Page 리뉴얼: Hero 섹션에 고해상도 이미지/비디오 배경과 강력한 Copywriting 배치.

Dashboard 고도화: 사용자 개인화 요약 카드를 최상단에 배치하고 가독성 높은 그리드 레이아웃 적용.

Mobile Web App (PWA) 대응: 모바일 환경에서 앱처럼 느껴지도록 Bottom Navigation Bar 최적화.