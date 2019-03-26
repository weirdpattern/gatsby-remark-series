const localCache = {};

import { resolveSeriesPath } from "./utils";

/**
 * Validates the context of the request.
 * @param {string} mode the mode to be used.
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {boolean} true if the context is valid; false otherwise.
 */
function validContext(mode, context, options) {
  if (options.render.mode !== mode) return false;

  const series = options.series(context.markdownNode);
  if (series == null) return false;

  return true;
}

/**
 * Renders the table of content at the top of the page.
 * @param {object} values the template values to be used.
 * @returns {void}
 */
function renderTop(values) {
  if (
    options.render.placeholder === "top" ||
    options.render.placeholder === "both"
  ) {
    markdownAST.children.unshift({
      type: "html",
      value: options.template({
        placeholder: "top",
        ...values
      })
    });
  }
}

/**
 * Renders the table of content at the bottom of the page.
 * @param {object} values the template values to be used.
 * @returns {void}
 */
function renderBottom(values) {
  if (
    options.render.placeholder === "bottom" ||
    options.render.placeholder === "both"
  ) {
    markdownAST.children.push({
      type: "html",
      value: options.render.template({
        placeholder: "bottom",
        ...values
      })
    });
  }
}

/**
 * Renders the table of content as an external link.
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {AST} the modified markdownAST.
 */
export function external(context, options) {
  if (!validContext("external", context, options)) return context.markdownAST;

  const { markdownAST, markdownNode, pathPrefix } = context;

  const series = options.series(markdownNode);
  const path = resolveSeriesPath(
    options.slug({ frontmatter: { title: series } }),
    pathPrefix,
    options.pathPrefix
  );

  renderTop({ items, slug: path, name: series, ...context });
  renderBottom({ items, slug: path, name: series, ...context });

  return markdownAST;
}

/**
 * Renders the table of content as an inline element.
 * @param {GatsbyContext} context the gatsby context to be used.
 * @param {PluginOptions} options the plugin options to be used.
 * @returns {AST} the modified markdownAST.
 */
export function inline(context, options) {
  if (!validContext("inline", context, options)) return context.markdownAST;

  const { markdownAST, markdownNode, createContentDigest, getNodes } = context;

  const series = options.slug(markdownNode);
  const identifier = `series--${createContentDigest(series)}`;

  // cache gets cleared on every build, but that should be enough
  // to prevent siblings from unnecessarily rebuilding the list.
  let items = localCache[identifier];
  if (items == null) {
    items = getNodes()
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

    localCache[identifier] = items;
  }

  renderTop({ items, name: series, ...context });
  renderBottom({ items, name: series, ...context });

  return markdownAST;
}
