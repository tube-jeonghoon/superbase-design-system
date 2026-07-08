---
"@superbase/tokens": minor
---

브랜드 컬러를 blue에서 green으로 전면 교체. green 10단계 + neutral(그린 틴트) 9단계로 팔레트를 재구성하고, yellow를 amber로 대체했습니다. status 색 갱신(success `#1d9e6b`, warning `#7a5b16`, danger `#c13a2a`, info `#2e6ecc`), focus-ring도 그린으로 변경. 컴포넌트 API 변경은 없으며, 업그레이드 시 브랜드 색상만 그린으로 바뀝니다.

`white`/`black` primitive는 제거되었습니다(`--color-neutral-000`, `--color-neutral-900`으로 대체). `--color-white`를 직접 참조하던 곳은 `--color-text-on-brand`로 옮겨야 합니다.
