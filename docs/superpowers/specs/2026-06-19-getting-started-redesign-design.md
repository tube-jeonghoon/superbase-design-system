# Getting Started 페이지 리디자인 — 설계 문서

> 작성일: 2026-06-19
> 상태: 승인됨

## 배경 & 목표
홈(`/`) 페이지가 제목+부제+날 것 `<pre>` 설치 블록+버튼 2개로 밋밋하다. 컴포넌트/Foundations 페이지와 같은 디자인 언어로 다듬는다. `apps/docs`만 변경.

## 설계
기존 프리미티브 재사용. 페이지는 `"use client"`(CodeBlock 사용).

1. **히어로** — `ComponentDoc`(제목 display + 리드) + 요약 한 줄(`토큰 · 웹/모바일 컴포넌트 10종 · 아이콘 · 다크 모드`).
2. **설치** — 날 것 `<pre>` 제거, `CodeBlock`(하이라이팅+복사)로 2블록:
   - `npm install @superbase/tokens @superbase/react` (language="bash")
   - import 스니펫(기존)
3. **둘러보기** — 버튼 2개 → 카드 3개(`<a>` 링크): Foundations(색·타이포·간격·반경 토큰) / Components(버튼·입력·뱃지 등 컴포넌트 9종) / Icon(라인 아이콘 18종).

## 파일
- `apps/docs/app/page.tsx` 재작성(기존 import는 ComponentDoc/CodeBlock로 교체).

## 테스트
프리미티브(ComponentDoc/CodeBlock)는 이미 테스트됨. 페이지는 `next build` 성공으로 검증(별도 단위 테스트 없음).

## 범위 밖
별도 랜딩 그래픽/애니메이션, 새 컴포넌트.
