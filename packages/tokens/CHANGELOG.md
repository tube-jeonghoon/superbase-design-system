# @superbase/tokens

## 0.4.0

### Minor Changes

- 2225877: 브랜드 컬러를 blue에서 green으로 전면 교체. green 10단계 + neutral(그린 틴트) 9단계로 팔레트를 재구성하고, yellow를 amber로 대체했습니다. status 색 갱신(success `#1d9e6b`, warning `#7a5b16`, danger `#c13a2a`, info `#2e6ecc`), focus-ring도 그린으로 변경. 컴포넌트 API 변경은 없으며, 업그레이드 시 브랜드 색상만 그린으로 바뀝니다.

  `white`/`black` primitive는 제거되었습니다(`--color-neutral-000`, `--color-neutral-900`으로 대체). `--color-white`를 직접 참조하던 곳은 `--color-text-on-brand`로 옮겨야 합니다.

- d186130: semantic 토큰 `color.text.onBrand`(웹 `--color-text-on-brand`, RN `t.color.text.onBrand`) 추가 — brand·status 배경 위에 얹는 전경색. 라이트·다크 모두 흰색이다(brand가 두 테마에서 같은 green.500이므로).

  그린 리브랜딩이 primitives에서 `white`/`black`을 제거했는데 웹 컴포넌트 CSS 7곳이 여전히 `var(--color-white)`를 참조하고 있었다. 정의되지 않은 CSS 변수는 조용히 무효화되므로 Button primary·Badge(brand/success/warning/danger) 글자색이 검정으로, Checkbox 체크마크와 Switch 손잡이는 투명(= 안 보임)으로 깨져 있었다. 이 참조들을 새 semantic 토큰으로 교체해 수정한다. React Native는 같은 값을 `"#ffffff"`로 하드코딩하고 있어 육안상 정상이었으나, 동일 토큰을 경유하도록 통일했다.

  `--color-white`/`--color-black`을 직접 참조하던 소비자는 `--color-text-on-brand` 또는 `--color-neutral-000`으로 옮겨야 한다.

## 0.3.0

### Minor Changes

- a3d1ec6: 파운데이션 토큰 확장: shadow/elevation, motion(duration·easing), focus-ring, opacity, border-width, z-index, line-height, letter-spacing, component-size 토큰 추가. RN용 런타임 테마 객체 `lightTheme`/`darkTheme`를 `@superbase/tokens/native/theme`로 export(기존 flat export·웹 CSS 변수는 하위호환 유지).
- cb2ee46: TextField 심화: `size`(sm/md/lg), `prefix`/`suffix` 슬롯, `clearable`(✕ 버튼), `helperText` 추가. 입력부를 control 컨테이너로 재구성(포커스링은 컨테이너 `:focus-within`). 신규 토큰 `--size-field-sm`(40)/`--size-field-lg`(56) 추가. 전부 추가만이라 하위호환.
- 060275e: 작은 컴포넌트 심화 + Icon 스케일: Checkbox `indeterminate`(aria-checked=mixed + 대시), Badge `size`(sm/md)·`icon`·`dot`, Switch·Radio `size`(sm/md), Icon `size`에 명명값(xs/sm/md/lg) 허용(number도 유지). 신규 토큰 `--size-icon-xs`(12)/`--size-control-sm`(16)/`--size-switch-sm-*`(40/24/20). 전부 추가만이라 하위호환.
- a7f4a2c: 신규 컴포넌트: Card(elevation none/sm/md/lg + bordered + padding, Phase 1 shadow 토큰 활용)와 Avatar(이미지 + name 이니셜 → user 아이콘 폴백, size sm/md/lg, shape circle/square). 신규 토큰 `--size-avatar-{sm,md,lg}`(32/40/56). 둘 다 web/RN 패리티 + forwardRef.
- 6a58df5: Add overlay infrastructure (Portal/focus-trap/scroll-lock/escape) and Modal/Dialog (compound: Modal + ModalHeader/ModalBody/ModalFooter) for web and React Native. New tokens: background scrim color and modal width sizes (sm/md/lg).
- 3a456ff: Add Toast notifications with an imperative ToastProvider/useToast API (show/success/error/warning/info/dismiss) for web and React Native. Auto-dismiss, stacking, action button, and bottom-center placement. New token: toast width size.

## 0.2.0

### Minor Changes

- 7438298: 토큰에 status 색(info/success/warning/danger)을 추가하고, 웹 컴포넌트 Checkbox, RadioGroup+Radio, Badge, Spinner를 추가한다.
