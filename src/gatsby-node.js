import { resolve } from "path";
import { resolveOptions, resolveSeriesPath, sortItems } from "./utils";

const touched = {};

/** @inheritdoc */
export function createPages(
  { getNodes, pathPrefix, reporter, actions: { createPage } },
  pluginOptions
) {
  const options = resolveOptions(pluginOptions, reporter);
  if (options.render.useLandingPage !== true) return;

  const series = getNodes()
    .filter(
      node =>
        node.internal.type === "MarkdownRemark" &&
        options.resolvers.series(node) != null
    )
    .reduce((map, node) => {
      const name = options.resolvers.series(node);

      map[name] = map[name] || [];
      map[name].push({
        title: node.frontmatter.title,
        slug: options.resolvers.slug(node),
        date: options.resolvers.date(node),
        draft: options.resolvers.draft(node),
        order: options.resolvers.order(node),
        series: name
      });

      return map;
    }, {});

  Object.keys(series).map(key => {
    const slug = resolveSeriesPath(
      options.resolvers.toSlug(key),
      pathPrefix,
      options.render.landingPagePathPrefix,
      reporter
    );

    createPage({
      path: slug,
      component: resolve(options.render.landingPageComponent),
      context: {
        name: key,
        items: series[key].sort(sortItems)
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

  if (
    node.internal.type === "MarkdownRemark" &&
    options.resolvers.series(node) != null
  ) {
    const series = options.resolvers.series(node);

    // keep track of the items already processed (by content digest hash)
    // slow, but guarantees uniqueness
    touched[series] = touched[series] || new Set();
    touched[series].add(node.internal.contentDigest);

    const siblings = getNodes().filter(
      sibling =>
        sibling.internal.type === "MarkdownRemark" &&
        options.resolvers.series(sibling) === series &&
        !touched[series].has(sibling.internal.contentDigest)
    );

    // force every item in the series to refresh
    // by setting a random contentDigest
    for (const sibling of siblings) {
      sibling.internal.contentDigest = createContentDigest(
        new Date().getTime().toString()
      );

      touched[series].add(sibling.internal.contentDigest);
    }
  }
}
