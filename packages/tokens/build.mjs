import StyleDictionary from "style-dictionary";
StyleDictionary.registerTransform({
  name: "size/px-to-number",
  type: "value",
  transitive: true,
  filter: (token) =>
    typeof token.value === "string" && /^-?\d*\.?\d+px$/.test(token.value),
  transform: (token) => parseFloat(token.value),
});
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";
import { shadowCssLines } from "./src/shadows.mjs";

rmSync("dist", { recursive: true, force: true });

// 1) light(:root) + native TS
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync("dist/web/variables.css", "utf8");

// 2) dark([data-theme="dark"]) — overwrites variables.css, read separately
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync("dist/web/variables.css", "utf8");

// 3) shadow :root 블록 (SD 밖 단일소스)
const shadowBlock = `:root {\n${shadowCssLines()}\n}`;

// 4) light + shadow + dark 병합 후 최종 파일 작성
writeFileSync("dist/web/variables.css", `${lightCss}\n${shadowBlock}\n${darkCss}`);
