import generateExternalTOC from "./utils/generate-external-toc";
import generateInlineTOC from "./utils/generate-inline-toc";

import { resolveOptions } from "./utils/options";

/**
 * @typedef {object} PluginOptions
 */

/**
 * Handles the markdown AST.
 * @param {RemarkPluginContext} context the remark plugin context.
 * @param {PluginOptions} options the options of the plugin.
 * @returns {*} the markdown ast.
 */
export default async (context, options) => {
  const resolvedOptions = resolveOptions(options);

  return options.external != null
    ? await generateExternalTOC(context, resolvedOptions)
    : await generateInlineTOC(context, resolvedOptions);
};
