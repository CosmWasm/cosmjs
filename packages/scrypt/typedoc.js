const packageJson = require("./package.json");

module.exports = {
  src: ["./src"],
  out: "docs",
  exclude: "**/*.spec.ts",
  target: "es6",
  name: `${packageJson.name} Documentation`,
  readme: "README.md",
  mode: "file",
  excludeExternals: true,
  excludeNotExported: true,
  excludePrivate: true,
};
