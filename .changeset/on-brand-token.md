---
"@superbase/tokens": minor
"@superbase/react": patch
"@superbase/react-native": patch
---

semantic 토큰 `color.text.onBrand`(웹 `--color-text-on-brand`, RN `t.color.text.onBrand`) 추가 — brand·status 배경 위에 얹는 전경색. 라이트·다크 모두 흰색이다(brand가 두 테마에서 같은 green.500이므로).

그린 리브랜딩이 primitives에서 `white`/`black`을 제거했는데 웹 컴포넌트 CSS 7곳이 여전히 `var(--color-white)`를 참조하고 있었다. 정의되지 않은 CSS 변수는 조용히 무효화되므로 Button primary·Badge(brand/success/warning/danger) 글자색이 검정으로, Checkbox 체크마크와 Switch 손잡이는 투명(= 안 보임)으로 깨져 있었다. 이 참조들을 새 semantic 토큰으로 교체해 수정한다. React Native는 같은 값을 `"#ffffff"`로 하드코딩하고 있어 육안상 정상이었으나, 동일 토큰을 경유하도록 통일했다.

`--color-white`/`--color-black`을 직접 참조하던 소비자는 `--color-text-on-brand` 또는 `--color-neutral-000`으로 옮겨야 한다.
