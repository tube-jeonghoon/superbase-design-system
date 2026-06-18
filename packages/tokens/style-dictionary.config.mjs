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
      transformGroup: "js",
      buildPath: "dist/native/",
      files: [{ destination: "tokens.ts", format: "javascript/es6" }]
    }
  }
};

export const darkConfig = {
  source: ["src/primitives.json", "src/semantic.dark.json"],
  platforms: {
    css: cssFile('[data-theme="dark"]')
  }
};
