# Foundation 토큰 개편 (Sub-project A) — 설계

날짜: 2026-07-06
상태: 설계 확정 대기

## 배경 / 전체 그림

SDS.design 문서 사이트 리뉴얼 시안(홈·컴포넌트 목록·컴포넌트 상세·**Foundation 컬러**)을 받았다.
시안은 기존 파란색 브랜드를 **그린 브랜드 + 그린 틴트 Neutral + Semantic 재정의**로 완전히 교체한다.

작업 규모가 커서 **2개 하위 프로젝트로 분해**한다. 각자 스펙 → 플랜 → 구현 사이클을 밟는다.

- **A. Foundation 토큰 개편** (이 문서) — 색 팔레트/시맨틱 전면 교체. 먼저 진행. 독립 빌드·테스트·배포 가능.
- **B. 사이트 리뉴얼** (후속 스펙) — 공용 상단 네비/푸터 셸 + 홈 + 컴포넌트 목록 + 컴포넌트 상세. A 위에 얹는다.

A를 먼저 하는 이유: 그린이 토큰에서 나오므로, B의 컴포넌트 미리보기가 자동으로 그린이 되어 "미리보기만 파랑" 문제가 사라진다.

## 확정된 결정 (브레인스토밍)

- **브랜드**: primary를 실제로 그린으로 교체 (docs 스킨이 아니라 토큰 자체). 라이브러리 배포 브랜드가 그린이 된다.
- **색 저장 형식**: **HEX 저장**. 시안 캡션의 "oklch로 정의"는 팔레트 *설계 근거*이고, 저장·출력은 HEX. RN이 oklch를 렌더하지 못하므로 빌드 파이프라인은 무변경.
- **데이터**: 시안의 마케팅 수치(48개·v3.2·@superbase/ui)는 무시. 실제 저장소 기준(컴포넌트 17종, @superbase/react v0.5.0).
- **컴포넌트 코드**: 웹·RN 어디에서도 색 primitive를 직접 참조하지 않음(전부 semantic 경유). → **컴포넌트 코드 무변경**.

## 스코프 (A에 포함)

1. `packages/tokens/src/primitives.json` — 색 팔레트 전면 교체
2. `packages/tokens/src/semantic.light.json` / `semantic.dark.json` — 시맨틱 remap
3. `packages/tokens` 재빌드 (`dist/web/variables.css`, `dist/native/*` 재생성)
4. `packages/tokens/test/build.test.ts` + 스냅샷 갱신
5. `apps/docs/app/foundations/page.tsx` — 시안대로 재작성 (Green/Neutral 스케일 + Semantic 카드)
6. `apps/docs/lib/palette.ts` (신규) — 파운데이션 페이지용 팔레트 표시 데이터
7. changeset 추가 (버전 bump)
8. (정리) docs 데모의 하드코딩 `#3182f6`(stack/icon 페이지) → 그린으로 교체

## 스코프 아웃 (B로 이월)

- 공용 상단 네비(SiteHeader)/그린 푸터 등 사이트 **크롬** — 시안 Foundation 페이지의 상단바는 B에서 온다. A에서는 파운데이션 페이지가 **기존 AppShell(사이드바) 아래**에서 렌더된다(색은 새 토큰이라 정상, 레이아웃 크롬만 임시).
- 홈 / 컴포넌트 목록 / 컴포넌트 상세 페이지
- status의 soft/background 변형(green.100 등)을 **새 semantic 토큰으로** 추가하는 일. 이번엔 primitive를 파운데이션 페이지에 직접 표시만 하고, semantic 구조(info/success/warning/danger 단일값)는 유지한다 → Badge 등 컴포넌트 무영향.

## 새 색 팔레트 (primitives.json)

기존 `blue/gray/white/black/green(#00b26d)/red(#f04452)/yellow` 색 그룹을 아래로 **완전 대체**한다.
(spacing/radius/font/borderWidth/opacity/lineHeight/letterSpacing/duration/easing/zIndex/focusRing 등 비색 토큰은 focusRing.color만 제외하고 무변경.)

### green — 브랜드·액션·하이라이트
| step | hex | 역할 |
|---|---|---|
| 050 | `#EAF7F0` | 페이지 배경 |
| 100 | `#D3F0E2` | Secondary 버튼·뱃지 |
| 200 | `#A9E9CC` | |
| 300 | `#7FE6BC` | 다크 위 액센트 |
| 400 | `#45C393` | |
| 500 | `#1D9E6B` | **Primary 액션 (브랜드)** |
| 600 | `#17855A` | brand pressed |
| 700 | `#146D4B` | |
| 800 | `#12533A` | |
| 900 | `#123B2C` | 히어로·푸터 |

### neutral — 그린 틴트 회색 (텍스트·보더·서피스). 기존 `gray`를 대체(개명)
| step | hex | 역할 |
|---|---|---|
| 000 | `#FFFFFF` | 서피스(기존 white 대체) |
| 050 | `#F6F8F6` | subtle 배경 |
| 100 | `#ECF0ED` | |
| 200 | `#E2E8E4` | 보더 |
| 300 | `#C6CFC9` | |
| 400 | `#8A968F` | 뮤트/disabled 텍스트 |
| 500 | `#5C6A62` | 보조 텍스트 |
| 700 | `#35423B` | 다크 보더/서피스 |
| 900 | `#16211C` | 본문 텍스트 |

### 상태색 primitive
| 그룹 | step | hex |
|---|---|---|
| red | 500 | `#C13A2A` |
| red | 100 | `#F8E0DB` |
| amber | 700 | `#7A5B16` |
| amber | 100 | `#F5ECCF` |
| blue | 500 | `#2E6ECC` |
| blue | 100 | `#E1EBFA` |

- `green.500`이 success를 겸한다(시안: "Success는 Green 스케일을 그대로 사용").
- `amber`가 기존 `yellow`를 대체. `blue`는 info 전용으로만 잔존.
- `white`/`black` primitive 제거(참조를 neutral.000 및 리터럴 rgba로 이관).

## 시맨틱 remap

### semantic.light.json
| 토큰 | 기존 | 신규 |
|---|---|---|
| text.primary | gray.900 | **neutral.900** |
| text.secondary | gray.600 | **neutral.500** |
| text.disabled | gray.400 | **neutral.400** |
| background.default | white | **neutral.000** |
| background.subtle | gray.50 | **neutral.050** |
| background.scrim | rgba(0,0,0,0.5) | (유지, 리터럴) |
| brand.primary | blue.500 | **green.500** |
| brand.pressed | blue.600 | **green.600** |
| border.default | gray.200 | **neutral.200** |
| status.info | blue.500 | **blue.500** (#2E6ECC) |
| status.success | green.500 | **green.500** (#1D9E6B) |
| status.warning | yellow.500 | **amber.700** |
| status.danger | red.500 | **red.500** (#C13A2A) |

### semantic.dark.json
| 토큰 | 기존 | 신규 |
|---|---|---|
| text.primary | gray.50 | **neutral.050** |
| text.secondary | gray.400 | **neutral.400** |
| text.disabled | gray.600 | **neutral.500** |
| background.default | gray.900 | **neutral.900** |
| background.subtle | gray.800 | **neutral.700** |
| background.scrim | rgba(0,0,0,0.6) | (유지) |
| brand.primary | blue.500 | **green.500** |
| brand.pressed | blue.600 | **green.600** |
| border.default | gray.800 | **neutral.700** |
| status.* | (동일 구조) | light과 동일 값 |

### focusRing (primitives.json)
- `color`: `rgba(49, 130, 246, 0.4)` → `rgba(29, 158, 107, 0.4)` (green.500 = rgb(29,158,107))

## 빌드 파이프라인

무변경. `pnpm --filter @superbase/tokens build`(= `node build.mjs`)이 style-dictionary로:
- `dist/web/variables.css` (`:root` light + `[data-theme="dark"]` dark + shadow 블록)
- `dist/native/{tokens.js,tokens.d.ts,theme.js,theme.d.ts,tokens.*.json}`

HEX만 쓰므로 `color/css` 변환·`size/px-to-number` 등 기존 transform 그대로 동작. `theme.d.ts`의 인터페이스(색은 전부 `string`) 구조 변화 없음.

## 테스트 갱신

`packages/tokens/test/build.test.ts` — 하드코딩 색 단언을 새 값으로:
- `--color-blue-500: #3182f6;` → `#2e6ecc`
- `ColorBlue500 = "#3182f6"` → `#2e6ecc`
- `--color-status-success: #00b26d;` → `#1d9e6b`
- `ColorStatusSuccess = "#00b26d"` → `#1d9e6b`
- `--focus-ring-color: rgba(49, 130, 246, 0.4);` → `rgba(29, 158, 107, 0.4)`
- gray 관련 단언이 있으면 neutral로 갱신
- 스냅샷 `build.test.ts.snap` → `vitest -u`로 재생성 후 육안 검토

`apps/docs/lib/tokens.test.ts` — 색 **구조**만 단언(길이 12, `--color-*` prefix, group) → **무변경**.
SD 출력은 소문자 hex(`#1d9e6b`)임에 유의.

## 파운데이션 페이지 재작성

`apps/docs/lib/palette.ts` (신규): 표시용 데이터.
```ts
export const greenScale = [{ step: "050", hex: "#EAF7F0", role?: string }, ...] // 10개
export const neutralScale = [...] // 9개
export const semanticSwatches = [
  { name: "Success", base: "green.500", soft: "green.100", example: "완료" },
  { name: "Danger",  base: "red.500 #C13A2A", soft: "red.100 #F8E0DB", example: "실패" },
  { name: "Warning", base: "amber.700 #7A5B16", soft: "amber.100 #F5ECCF", example: "대기중" },
  { name: "Info",    base: "blue.500 #2E6ECC", soft: "blue.100 #E1EBFA", example: "안내" },
]
```

`app/foundations/page.tsx`: 시안 구성 —
- eyebrow `FOUNDATION · COLOR`, 타이틀 "컬러 토큰", 캡션(oklch 설명 문구)
- **Green** 섹션: 이어붙인 10-스와치 바 + 각 아래 step/hex + 역할 chip 행
- **Neutral** 섹션: 9-스와치 바 + step/hex + 역할 chip 행
- **Semantic** 섹션: Success/Danger/Warning/Info 카드(각 base+soft 스와치 + hex + 예시 뱃지)
- 스와치는 정적 hex 배열을 직접 렌더(라이브 CSS var 파싱 아님) — 시안대로 정확한 hex 노출.
- A 단계에서는 기존 `AppShell`(사이드바) 아래 렌더. 상단 그린 네비/푸터 크롬은 B에서 적용.

## changeset

`@superbase/tokens` 및 이를 재노출하는 패키지 버전 bump. 색 브랜드 변경은 시각적으로 파괴적이므로 **minor 이상**(초기 0.x라 minor로 충분). 메시지에 "브랜드 컬러 blue→green 전면 교체, gray→neutral(그린틴트) 개편, yellow→amber, status 색 갱신" 명시.

## 검증 (완료 기준)

1. `pnpm --filter @superbase/tokens test` 통과 (갱신된 단언·스냅샷)
2. `pnpm turbo run typecheck test build` 저장소 전체 그린
3. `dist/web/variables.css`에 `--color-brand-primary: #1d9e6b;`, `--color-status-warning: #7a5b16;` 등 신규 값 확인
4. docs 실행 후 파운데이션 페이지가 시안대로(Green 10 / Neutral 9 / Semantic 4카드) 렌더
5. 아무 컴포넌트(Button) 미리보기가 그린으로 렌더되는지 육안 확인
6. 다크 모드 토글 시 배경/텍스트가 neutral 다크 스케일로 정상 전환

## 리스크 / 주의

- **스냅샷 대량 변경**: `-u`로 재생성 후 diff를 육안 검토(의도치 않은 토큰 누락 방지).
- **white/black 제거**: `{color.white}`/`{color.black}` 잔여 참조가 없는지 remap 후 grep 재확인.
- **RN 값**: hex라 문제 없음. `theme.js`의 색이 새 hex인지 스팟 체크.
- **소문자 hex**: 테스트 단언은 SD 출력 형식(소문자)에 맞출 것.
