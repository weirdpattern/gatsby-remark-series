import { external, inline } from "./misc/table-of-content";
import { resolveOptions } from "./misc/utils";

/**
 * Handles the markdown AST.
 * @param {RemarkPluginContext} context the remark plugin context.
 * @param {PluginOptions} pluginOptions the options of the plugin.
 * @returns {*} the markdown ast.
 */
export default (context, pluginOptions) => {
  const options = resolveOptions(pluginOptions);

  return options.render.mode === "external"
    ? external(context, options)
    : inline(context, options);
};
