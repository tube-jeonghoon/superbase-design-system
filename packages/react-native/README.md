# @superbase/react-native

React Native용 컴포넌트. `@superbase/react`와 동일한 컴포넌트 API(Text/Button/TextField/Stack/Switch)를 제공하며 `@superbase/tokens`의 native 토큰을 소비한다.

## 사용

    import { Button, Text } from "@superbase/react-native";

`react-native`은 peerDependency다(앱이 제공). 토큰은 native 값(숫자 단위)으로 빌드되어 RN 스타일에 직접 쓰인다.

## 테스트

시뮬레이터 없이 `react-native-web` + jsdom으로 헤드리스 단위 테스트한다:

    pnpm --filter @superbase/react-native test

## v1 한계

- native 토큰의 light 값만 사용(정적). RN 다크 테마(런타임 ThemeProvider)는 v2 과제.
