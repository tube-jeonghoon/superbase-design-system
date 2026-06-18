import StyleDictionary from "style-dictionary";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { lightConfig, darkConfig } from "./style-dictionary.config.mjs";

rmSync("dist", { recursive: true, force: true });

// 1) light(:root) + native TS
const light = new StyleDictionary(lightConfig);
await light.buildAllPlatforms();
const lightCss = readFileSync("dist/web/variables.css", "utf8");

// 2) dark([data-theme="dark"]) — overwrites the same file, so read separately and merge
const dark = new StyleDictionary(darkConfig);
await dark.buildAllPlatforms();
const darkCss = readFileSync("dist/web/variables.css", "utf8");

// 3) append dark block after light and write final file
writeFileSync("dist/web/variables.css", `${lightCss}\n${darkCss}`);
