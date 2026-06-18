export default {
  source: ["src/primitives.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "dist/web/",
      files: [
        {
          destination: "variables.css",
          format: "css/variables"
        }
      ]
    },
    native: {
      transformGroup: "js",
      buildPath: "dist/native/",
      files: [
        {
          destination: "tokens.ts",
          format: "javascript/es6"
        }
      ]
    }
  }
};
