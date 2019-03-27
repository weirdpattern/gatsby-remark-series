module.exports = {
  presets: [
    [
      "@babel/env",
      {
        forceAllTransforms: true,
        targets: {
          node: 6
        }
      }
    ]
  ],
  plugins: [
    "add-module-exports",
    "@babel/plugin-transform-spread"
  ]
};
