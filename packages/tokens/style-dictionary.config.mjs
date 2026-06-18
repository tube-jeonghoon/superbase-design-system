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

export const lightConfig = {
  source: ["src/primitives.json", "src/semantic.light.json"],
  platforms: {
    css: cssFile(":root"),
    native: {
      transforms: ["attribute/cti", "name/pascal", "color/css", "size/px-to-number"],
      buildPath: "dist/native/",
      files: [
        { destination: "tokens.js", format: "javascript/es6" },
        { destination: "tokens.d.ts", format: "typescript/es6-declarations" }
      ]
    }
  }
};

export const darkConfig = {
  source: ["src/primitives.json", "src/semantic.dark.json"],
  platforms: {
    css: cssFile('[data-theme="dark"]')
  }
};
