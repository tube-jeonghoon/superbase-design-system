export interface Shade {
  step: string;
  hex: string;
}

export interface RoleChip {
  label: string;
  hex: string;
}

export const greenScale: Shade[] = [
  { step: "050", hex: "#EAF7F0" },
  { step: "100", hex: "#D3F0E2" },
  { step: "200", hex: "#A9E9CC" },
  { step: "300", hex: "#7FE6BC" },
  { step: "400", hex: "#45C393" },
  { step: "500", hex: "#1D9E6B" },
  { step: "600", hex: "#17855A" },
  { step: "700", hex: "#146D4B" },
  { step: "800", hex: "#12533A" },
  { step: "900", hex: "#123B2C" },
];

export const greenRoles: RoleChip[] = [
  { label: "050 페이지 배경", hex: "#EAF7F0" },
  { label: "100 Secondary 버튼·뱃지", hex: "#D3F0E2" },
  { label: "300 다크 위 액센트", hex: "#7FE6BC" },
  { label: "500 Primary 액션", hex: "#1D9E6B" },
  { label: "900 히어로·푸터", hex: "#123B2C" },
];

export const neutralScale: Shade[] = [
  { step: "000", hex: "#FFFFFF" },
  { step: "050", hex: "#F6F8F6" },
  { step: "100", hex: "#ECF0ED" },
  { step: "200", hex: "#E2E8E4" },
  { step: "300", hex: "#C6CFC9" },
  { step: "400", hex: "#8A968F" },
  { step: "500", hex: "#5C6A62" },
  { step: "700", hex: "#35423B" },
  { step: "900", hex: "#16211C" },
];

export const neutralRoles: RoleChip[] = [
  { label: "200 보더", hex: "#E2E8E4" },
  { label: "400 뮤트 텍스트", hex: "#8A968F" },
  { label: "500 보조 텍스트", hex: "#5C6A62" },
  { label: "900 본문 텍스트", hex: "#16211C" },
];

export interface SemanticSwatch {
  name: string;
  baseLabel: string;
  baseHex: string;
  softLabel: string;
  softHex: string;
  /** 예시 뱃지 라벨 */
  example: string;
}

export const semanticSwatches: SemanticSwatch[] = [
  { name: "Success", baseLabel: "green.500", baseHex: "#1D9E6B", softLabel: "green.100", softHex: "#D3F0E2", example: "완료" },
  { name: "Danger", baseLabel: "red.500 #C13A2A", baseHex: "#C13A2A", softLabel: "red.100 #F8E0DB", softHex: "#F8E0DB", example: "실패" },
  { name: "Warning", baseLabel: "amber.700 #7A5B16", baseHex: "#7A5B16", softLabel: "amber.100 #F5ECCF", softHex: "#F5ECCF", example: "대기중" },
  { name: "Info", baseLabel: "blue.500 #2E6ECC", baseHex: "#2E6ECC", softLabel: "blue.100 #E1EBFA", softHex: "#E1EBFA", example: "안내" },
];
