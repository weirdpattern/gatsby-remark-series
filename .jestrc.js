module.exports = {
  moduleFileExtensions: ["js", "jsx"],
  testMatch: [
    "**/specs/*.[Ss]pec{,s}.js{,x}",
    "**/specs/**/*.[Ss]pec{,s}.js{,x}"
  ],
  rootDir: ".",
  verbose: false,
  resetMocks: true,
  resetModules: true,
  collectCoverage: false,
  collectCoverageFrom: ["**/src/*.js{,x}"]
};
