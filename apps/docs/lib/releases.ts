export interface Release {
  version: string;
  title: string;
  summary: string;
}

export const releases: Release[] = [
  { version: "0.5.0", title: "Header 컴포넌트 + bar/floating variant 통일", summary: "Header compound 신규(onBack·알림 badge). Header·BottomNavigation에 bar/floating variant 도입." },
  { version: "0.4.0", title: "BottomNavigation + 웹 컴포넌트 하드닝", summary: "BottomNavigation 신규. 10개 컴포넌트 forwardRef·토큰화·focus-ring, Button/TextField/Card/Avatar/Tabs/Modal/Toast 심화." },
  { version: "0.3.0", title: "@superbase/icons + 웹 Icon", summary: "자체 큐레이션 아이콘 데이터 패키지와 이를 소비하는 웹 Icon 컴포넌트 추가." },
  { version: "0.2.0", title: "status 색 + 기본 폼 컴포넌트", summary: "토큰 status 색(info/success/warning/danger), Checkbox·Radio·Badge·Spinner 추가." },
];
