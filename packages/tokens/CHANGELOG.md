# @superbase/tokens

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
