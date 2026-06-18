# @superbase/react

웹용 React 컴포넌트. 디자인 토큰(CSS 변수)을 소비한다.

## 설치 / 사용

소비 앱에서 토큰 CSS와 컴포넌트 스타일을 함께 로드한다:

    import "@superbase/tokens/css";   // CSS 변수 (:root + [data-theme="dark"])
    import "@superbase/react/styles.css"; // 컴포넌트 스타일
    import { Button, Text } from "@superbase/react";

## 컴포넌트

- `Text` — variant(caption/body/title/display), weight, color
- `Button` — variant(primary/secondary), size(sm/md/lg)
- `TextField` — label, error, value, onChange(value: string). `value`를 넘기면 제어(controlled) 컴포넌트로 동작하므로 `onChange`에서 상태를 갱신해야 한다. `value`를 생략하면 비제어로 동작한다.
- `Stack` — direction, gap, padding(spacing scale), align, justify
- `Switch` — checked, onChange(checked: boolean), disabled

다크 테마는 소비 앱에서 최상위 요소에 `data-theme="dark"`를 설정하면 적용된다.
