import { resolveSeriesPath } from "./index/options";

/** @inheritdoc */
export async function createPages(
  { graphql, pathPrefix, actions: { createPage } },
  options
) {
  if (options.render.mode !== "external") return;

  const result = await graphql(
    `
      {
        series: allMarkdownRemark {
          edges {
            node {
              frontmatter {
                date
                title
                ${options.draftField}
                ${options.orderField}
                ${options.seriesField}
              }
            }
          }
        }
      }
    `
  );

  const series = result.data.all.edges.reduce((map, node) => {
    const name = node.frontmatter.series;

    if (name == null) return map;

    map[name] = map[name] || [];
    map[name].push({ ...node.fields.slug, ...node.frontmatter });

    return map;
  }, {});

  Object.keys(series).map(key => {
    createPage({
      path: resolveSeriesPath(key, pathPrefix, options.pathPrefix),
      component: options.externalLayout,
      context: {
        items: series[key]
      }
    });
  });
}
