import { resolveSeriesPath } from "./utils";

const localCache = {};

/**
 * Validates the context of the request.
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {boolean} true if the context is valid; false otherwise.
 */
function validContext(context, options) {
  const series = options.series(context.markdownNode);
  if (series == null) return false;

  return true;
}

/**
 * Renders the table of content at the top of the page.
 * @param {object} context the template context to be used.
 * @returns {void}
 */
function renderTop({ options, ...context }) {
  if (
    options.render.placeholder === "top" ||
    options.render.placeholder === "both"
  ) {
    context.markdownAST.children.unshift({
      type: "html",
      value: options.template({
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
 * @param {object} context the template values to be used.
 * @returns {void}
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
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {Array<object>} the nodes in the series.
 */
function getSeriesItems(context, options) {
  const series = options.series(context.markdownNode);
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
          options.series(node) === series
      )

      // map to something meaningful
      .map(node => {
        return {
          title: node.frontmatter.title,
          slug: options.slug(node),
          date: options.date(node),
          draft: options.draft(node),
          order: options.order(node),
          series: options.series(node)
        };
      })

      // sort
      // 1. order if available
      // 2. date if available
      // 3. title
      .sort((left, right) => {
        const orderLeft = Number(left.order);
        const orderRight = Number(right.order);

        if (!isNaN(orderLeft) && !isNaN(orderRight)) {
          return orderLeft - orderRight;
        }

        if (!isNaN(orderLeft)) return -1;
        if (!isNaN(orderRight)) return 1;

        const dateLeft = new Date(left.date);
        const dateRight = new Date(right.date);

        if (!isNaN(dateLeft.getTime()) && !isNaN(dateRight.getTime())) {
          return dateLeft - dateRight;
        }

        if (!isNaN(dateLeft.getTime())) return -1;
        if (!isNaN(dateRight.getTime())) return 1;

        return left.title.localCompare(right.title);
      });

    localCache[cacheKey] = items;
  }

  return items;
}

/**
 * Renders the table of content.
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {AST} the modified markdownAST.
 */
export default (context, options) => {
  if (!validContext(context, options)) return context.markdownAST;

  const { markdownAST, markdownNode, pathPrefix } = context;

  const series = options.series(markdownNode);
  const items = getSeriesItems(context, options);

  const path = resolveSeriesPath(
    options.toSlug(series),
    pathPrefix,
    options.pathPrefix
  );

  renderTop({ options, items, name: series, slug: path, ...context });
  renderBottom({ options, items, name: series, slug: path, ...context });

  return markdownAST;
};
