module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        "env",
        {
          targets: {
            node: 6,
            uglify: true
          }
        }
      ]
    ],
    plugins: ["add-module-exports", "transform-object-rest-spread"]
  };
};
