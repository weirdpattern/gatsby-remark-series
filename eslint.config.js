const jest = require("eslint-plugin-jest").configs;

module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module"
  },
  extends: [
    "eslint:recommended",
    "plugin:jsdoc/recommended",
    "plugin:import/recommended",
    "prettier"
  ],
  plugins: ["import", "jest", "jsdoc", "prettier", "filenames"],
  env: {
    es6: true,
    node: true
  },
  rules: {
    "no-await-in-loop": "error",
    "no-async-promise-executor": "error",
    "no-console": "off",
    semi: ["error", "always"],
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    "import/no-named-as-default": "error",
    "import/no-named-as-default-member": "error",
    "import/no-duplicates": "error",
    "jsdoc/check-param-names": "error",
    "jsdoc/check-tag-names": "error",
    "jsdoc/check-types": "error",
    "jsdoc/newline-after-description": ["error", "never"],
    "jsdoc/no-undefined-types": "off",
    "jsdoc/require-description-complete-sentence": "error",
    "jsdoc/require-param": "error",
    "jsdoc/require-param-description": "error",
    "jsdoc/require-param-name": "error",
    "jsdoc/require-param-type": "error",
    "jsdoc/require-returns": "error",
    "jsdoc/require-returns-description": "error",
    "jsdoc/require-returns-type": "error",
    "jsdoc/require-returns-check": "error",
    "jsdoc/valid-types": "error",
    "prettier/prettier": "error"
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".json"]
      }
    },
    jsdoc: {
      allowOverrideWithoutParam: true,
      allowImplementsWithoutParam: true,
      allowAugmentsExtendsWithoutParam: true,
      jsdoc: {
        additionalTagNames: {
          ulint: ["contributor", "annotation", "decorator"]
        }
      }
    }
  },
  overrides: [
    {
      files: ["*[.-][Ss]pec{,s}.js{,x}"],
      plugins: ["jest"],
      env: {
        jest: true
      },
      rules: Object.assign({}, jest.recommended.rules, jest.style.rules, {
        "jest/consistent-test-it": ["error", { fn: "test" }],
        "jest/expect-expect": "error",
        "jest/lowercase-name": ["error", { ignore: ["describe"] }],
        "jest/no-test-callback": "error",
        "jest/prefer-spy-on": "error"
      })
    }
  ]
};
