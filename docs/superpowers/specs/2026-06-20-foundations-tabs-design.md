# Foundations 탭 구조 — 설계 문서

> 작성일: 2026-06-20
> 상태: 승인됨

## 목표
Foundations 페이지의 4개 섹션(Colors/Typography/Spacing/Radius)을 한 스크롤 → 탭 전환 UI로 나눈다. apps/docs만 변경. 콘텐츠·디자인 톤 유지.

## 설계
1. 로컬 `Tabs` 컴포넌트(`apps/docs/components/foundations/Tabs.tsx`, 클라이언트):
   - props: `items: { id, label, content: ReactNode }[]`, `ariaLabel?`
   - 접근성: role tablist/tab(aria-selected, aria-controls)/tabpanel(aria-labelledby). 활성 패널만 렌더, 나머지 hidden.
   - 스타일: 밑줄형 탭바, 활성 탭 brand 색+밑줄.
2. Foundations 페이지: `ComponentDoc`(제목+리드+요약) 아래 `<Tabs>` 4개(Colors/Typography/Spacing/Radius). 기존 섹션 JSX를 각 탭 content로 이동.

## 테스트
- `Tabs`: 첫 탭 기본 표시, 클릭 시 활성 패널 전환, role/aria-selected 검증.
- 페이지: next build 성공.

## 범위 밖
재사용 DS Tabs 컴포넌트(추후), URL 해시 동기화.
