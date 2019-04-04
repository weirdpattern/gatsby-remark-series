import { resolveSeriesPath, sortItems } from "./utils";

const localCache = {};

/**
 * Validates the context of the request.
 * @param {GatsbyContext} context The gatsby context to be used.
 * @param {PluginOptions} options The plugin options to be used.
 * @returns {boolean} True if the context is valid; false otherwise.
 */
function validContext(context, options) {
  const series = options.resolvers.series(context.markdownNode);
  if (series == null) return false;

  return true;
}

/**
 * Renders the table of content at the top of the page.
 * @param {Object} context The template context to be used.
 */
function renderTop({ options, ...context }) {
  if (
    options.render.placeholder === "top" ||
    options.render.placeholder === "both"
  ) {
    context.markdownAST.children.unshift({
      type: "html",
      value: options.render.template({
        placeholder: "top",
        name: context.name,
        slug: context.slug,
        items: context.items,
        pluginOptions: options,
        markdownNode: context.markdownNode
      })
    });
  }
}

/**
 * Renders the table of content at the bottom of the page.
 * @param {Object} context The template values to be used.
 */
function renderBottom({ options, ...context }) {
  if (
    options.render.placeholder === "bottom" ||
    options.render.placeholder === "both"
  ) {
    context.markdownAST.children.push({
      type: "html",
      value: options.render.template({
        placeholder: "bottom",
        name: context.name,
        slug: context.slug,
        items: context.items,
        pluginOptions: options,
        markdownNode: context.markdownNode
      })
    });
  }
}

/**
 * Gets all nodes associated to a series.
 * @param {GatsbyContext} context The gatsby context to be used.
 * @param {PluginOptions} options The plugin options to be used.
 * @returns {Array<Object>} The nodes in the series.
 */
function getSeriesItems(context, options) {
  const series = options.resolvers.series(context.markdownNode);
  const cacheKey = context.createContentDigest(series);

  // cache gets cleared on every build, but that should be enough
  // to prevent siblings from unnecessarily rebuilding the list.
  let items = localCache[cacheKey];
  if (items == null) {
    items = context
      .getNodes()

      // gets markdown remark elements that have a series
      .filter(
        node =>
          node.internal.type === "MarkdownRemark" &&
          options.resolvers.series(node) === series
      )

      // map to something meaningful
      .map(node => {
        return {
          title: node.frontmatter.title,
          slug: options.resolvers.slug(node),
          date: options.resolvers.date(node),
          draft: options.resolvers.draft(node),
          order: options.resolvers.order(node),
          series: options.resolvers.series(node)
        };
      })

      // sort
      // 1. order if available
      // 2. date if available
      // 3. title
      .sort(sortItems);

    localCache[cacheKey] = items;
  }

  return items;
}

/**
 * Renders the table of content.
 * @param {GatsbyContext} context The gatsby context to be used.
 * @param {PluginOptions} options The plugin options to be used.
 * @returns {AST} The modified markdownAST.
 */
export default (context, options) => {
  if (!validContext(context, options)) return context.markdownAST;

  const { markdownAST, markdownNode, pathPrefix } = context;

  const series = options.resolvers.series(markdownNode);
  const items = getSeriesItems(context, options);

  // path is only meaningful (and available to the developer)
  // when a landing page is requested
  const path =
    options.render.useLandingPage === true
      ? resolveSeriesPath(
          options.resolvers.toSlug(series),
          pathPrefix,
          options.render.landingPagePathPrefix
        )
      : null;

  renderTop({ options, items, name: series, slug: path, ...context });
  renderBottom({ options, items, name: series, slug: path, ...context });

  return markdownAST;
};
