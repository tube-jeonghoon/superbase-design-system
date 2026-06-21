// Shadow 토큰 단일소스. web(box-shadow 문자열)과 RN(객체) 둘 다 여기서 파생.
export const shadows = {
  sm: { x: 0, y: 1, blur: 2, color: "rgba(0, 0, 0, 0.06)", opacity: 0.06, elevation: 1 },
  md: { x: 0, y: 4, blur: 8, color: "rgba(0, 0, 0, 0.08)", opacity: 0.08, elevation: 4 },
  lg: { x: 0, y: 8, blur: 24, color: "rgba(0, 0, 0, 0.12)", opacity: 0.12, elevation: 8 },
  xl: { x: 0, y: 16, blur: 48, color: "rgba(0, 0, 0, 0.16)", opacity: 0.16, elevation: 16 },
};

// web CSS 변수 블록 본문 (":root { ... }" 안에 들어갈 줄들)
export function shadowCssLines() {
  return Object.entries(shadows)
    .map(([k, s]) => `  --shadow-${k}: ${s.x} ${s.y}px ${s.blur}px ${s.color};`)
    .join("\n");
}

// RN 테마용 shadow 객체 (react-native style 형태)
export function shadowNativeObject() {
  const out = {};
  for (const [k, s] of Object.entries(shadows)) {
    out[k] = {
      shadowColor: "#000000",
      shadowOffset: { width: s.x, height: s.y },
      shadowOpacity: s.opacity,
      shadowRadius: s.blur,
      elevation: s.elevation,
    };
  }
  return out;
}
