import defaultsDeep from "lodash.defaultsdeep";

import { DefaultSettings } from "./constants";

/**
 * Resolves the plug-in options to be used.
 * @param {PluginOptions} options The user defined options.
 * @returns {PluginOptions} The resolved options.
 */
export function resolveOptions(options) {
  return defaultsDeep({}, options, DefaultSettings);
}

/**
 * Resolves the series path (slug).
 * @param {string} name The name of the series.
 * @param {string} [pathPrefix] The global path prefix to be used.
 * @param {string} [userPathPrefix] The user defined path prefix to be used.
 * @returns {string} The resolved series path (slug).
 */
export function resolveSeriesPath(name, pathPrefix, userPathPrefix) {
  const path = [];

  if (typeof pathPrefix === "string" && pathPrefix.trim().length > 0) {
    path.push(pathPrefix);
  }

  if (typeof userPathPrefix === "string" && userPathPrefix.trim().length > 0) {
    path.push(userPathPrefix);
  }

  path.push(name);

  return path.join("/");
}
