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
    }
  }
};
