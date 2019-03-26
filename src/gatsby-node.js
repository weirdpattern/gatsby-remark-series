import { resolve } from "path";
import { resolveOptions, resolveSeriesPath } from "./misc/utils";

/** @inheritdoc */
export function createPages(
  { getNodes, pathPrefix, actions: { createPage } },
  pluginOptions
) {
  const options = resolveOptions(pluginOptions);
  if (options.render.mode !== "external") return;

  const series = getNodes()
    .filter(
      node =>
        node.internal.type === "MarkdownRemark" && options.series(node) != null
    )
    .reduce((map, node) => {
      const name = options.series(node);

      map[name] = map[name] || [];
      map[name].push({
        title: node.frontmatter.title,
        slug: options.slug(node),
        date: options.date(node),
        draft: options.draft(node),
        order: options.order(node),
        series: name
      });

      return map;
    }, {});

  Object.keys(series).map(key => {
    const slug = resolveSeriesPath(
      options.toSlug(key),
      pathPrefix,
      options.render.pathPrefix
    );

    createPage({
      path: slug,
      component: resolve(options.render.externalLayout),
      context: {
        name: key,
        items: series[key]
      }
    });
  });
}

/** @inheritdoc */
export function onCreateNode(
  { node, getNodes, createContentDigest },
  pluginOptions
) {
  const options = resolveOptions(pluginOptions);

  if (node.internal.type === "MarkdownRemark" && options.series(node) != null) {
    // get every item in the series, but the current one
    const series = options.series(node);
    const siblings = getNodes().filter(
      sibling =>
        sibling.internal.type === "MarkdownRemark" &&
        options.series(sibling) === series &&
        sibling.id !== node.id
    );

    // force every item in the series to refresh
    for (const sibling of siblings) {
      sibling.internal.contentDigest = createContentDigest(
        new Date().getTime()
      );
    }
  }
}
