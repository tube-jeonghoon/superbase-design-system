const cssFile = (selector) => ({
  transformGroup: "css",
  buildPath: "dist/web/",
  options: { outputReferences: false },
  files: [
    {
      destination: "variables.css",
      format: "css/variables",
      options: { selector }
    }
  ]
});

const nativeTransforms = ["attribute/cti", "name/pascal", "color/css", "size/px-to-number"];

export const lightConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.light.json"],
  platforms: {
    css: cssFile(":root"),
    native: {
      transforms: nativeTransforms,
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.d.ts", format: "typescript/es6-declarations" },
        { destination: "tokens.light.json", format: "json/nested" }
      ]
    }
  }
};

export const darkConfig = {
  source: ["src/primitives.json", "src/sizing.json", "src/semantic.dark.json"],
  platforms: {
    css: cssFile('[data-theme="dark"]'),
    native: {
      transforms: nativeTransforms,
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.dark.json", format: "json/nested" }
      ]
    }
  }
};
