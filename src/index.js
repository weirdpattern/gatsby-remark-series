import generateTOC from "./misc/generate-toc";
import { resolveOptions } from "./misc/utils";

/**
 * @typedef {Object} Resolvers
 * @property {Resolver} slug
 *    Locates and resolves the slug on the node.
 *    Default: node.frontmatter.slug
 *    Returns: string
 * @property {Resolver} date
 *    Locates and resolves the date on the node.
 *    Default: node.frontmatter.date
 *    Returns: string
 * @property {Resolver} draft
 *    Locates and resolves the draft flag on the node.
 *    Indicates the post is a draft, default behavior is to show the title,
 *    but without a link to the post
 *    Default: node.frontmatter.draft
 *    Returns: boolean
 * @property {Resolver} order
 *    Locates and resolves the order on the node.
 *    Indicates the position of the post in the series.
 *    Default: node.frontmatter.order
 *    Returns: number
 * @property {Resolver} series
 *    Locates and resolves the name of the series on the node.
 *    Default: node.frontmatter.series
 *    Returns: string
 * @property {Transformer} toSlug
 *    Takes a string and converts it to a slug representation.
 *    Default: converts the string to kebab-case using lodash.kebabCase.
 */

/**
 * @typydef {Function} Resolver
 * @param {MarkdownNode} markdownNode the markdown node with the needed information.
 * @returns {*} the value of the property the resolver is configured for.
 */

/**
 * @typedef {Function} Transformer
 * @param {string} value the value to be transformed.
 * @returns {string} the transformed value.
 */

/**
 * @typedef {Function} Template
 * @param {TemplateContext} context the information passed to the template.
 * @returns {string} the html to be rendered.
 */

/**
 * @typedef {Object} TemplateContext
 * @property {"top" | "bottom"} placeholder the location for the toc.
 * @property {string} name the name of the series.
 * @property {string} slug the slug of the series.
 * @property {Array<SeriesItem>} items the items in the series
 * @property {PluginOptions} pluginOptions the options of the plugin.
 * @property {MarkdownNode} markdownNode the markdown node being resolved.
 */

/**
 * @typedef {Object} Render
 * @property {"top" | "bottom"} placeholder
 *    The location for the toc.
 *    Possible values: top | bottom
 *    Default: bottom
 * @property {Template} template
 *    Provides a way to customize the output of the toc.
 *    Default: a simple template.
 * @property {boolean} useLandingPage
 *    A flag indicating a landing page is required.
 *    Default: false
 * @property {string} landingPagePathPrefix
 *    This can only be used in external mode.
 *    Provides a way to specify a prefix for the slug of the series.
 *    This is in addition to the pathPrefix that gatsby can already use.
 *    Defaults: null
 * @property {string} landingPageComponent
 *    This can only be used in external mode.
 *    Provides the path to the template layout (react component) to be used
 *    to render the external toc.
 *    Defaults: null
 *    Required!
 */

/**
 * @typedef {Object} PluginOptions
 * @property {Resolvers} resolvers Specify resolvers to be used to extract data.
 * @property {Render} render The rendering information to be used.
 */

/**
 * Handles the markdown AST.
 * @param {RemarkPluginContext} context The remark plugin context.
 * @param {PluginOptions} pluginOptions The options of the plugin.
 * @returns {*} The markdown ast.
 */
export default (context, pluginOptions) => {
  return generateTOC(context, resolveOptions(pluginOptions));
};
