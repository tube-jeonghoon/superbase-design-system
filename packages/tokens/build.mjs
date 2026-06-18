import StyleDictionary from "style-dictionary";
import config from "./style-dictionary.config.mjs";

const sd = new StyleDictionary(config);
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
