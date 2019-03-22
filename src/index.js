import generateExternalTOC from "./generate-external-toc";
import generateInlineTOC from "./generate-inline-toc";

import { DefaultSettings } from "./constants";

/**
 * @typedef {object} ExternalTOCOptions
 */

/**
 * @typedef {object} InlineTOCOptions
 */

/**
 * @typedef {object} PluginOptions
 * @property {string} field
 *    the remark field to be used to identified posts in a series.
 * @property {ExternalTOCOptions} external
 *    the options to be used for external tocs.
 * @property {InlineTOCOptions} inline the options to be used for inline tocs.
 */

/**
 * Handles the markdown AST.
 * @param {RemarkPluginContext} context the remark plugin context.
 * @param {PluginOptions} options the options of the plugin.
 * @returns {*} the markdown ast.
 */
export default async (context, options) => {
  const settings = Object.assign({}, DefaultSettings, options);

  if (options.external != null) {
    return await generateExternalTOC(context, settings);
  } else {
    return await generateInlineTOC(context, settings);
  }
};
