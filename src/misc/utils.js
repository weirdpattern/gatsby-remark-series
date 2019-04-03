import kebabCase from "lodash.kebabcase";
import defaultsDeep from "lodash.defaultsdeep";

/**
 * Default template.
 * @param {TemplateContext} context The context to be used.
 * @returns {string} The default template.
 */
export const DefaultTemplate = context => {
  let body;
  let title;

  if (context.pluginOptions.render.useLandingPage === true) {
    body = "";
    title = `<span>This post is part of the <a href="${context.slug}">${
      context.name
    }</a> series</span>`;
  } else {
    const list = context.items.reduce((code, item) => {
      const inner =
        item.draft !== true
          ? `<a href="${item.slug}">${item.title}</a>`
          : item.title;

      return `${code}<li>${inner}</li>`.trim();
    }, "");

    body = `<ol>${list}</ol>`;
    title = `<div>Other posts in the ${context.name} series</div>`;
  }

  return `
<div class="series-table-of-content">
  ${title}
  ${body}
</div>
  `.trim();
};

/**
 * Default options for the series.
 */
export const DefaultOptions = {
  resolvers: {
    slug: markdownNode => markdownNode.frontmatter.slug,
    date: markdownNode => markdownNode.frontmatter.date,
    draft: markdownNode => markdownNode.frontmatter.draft,
    order: markdownNode => markdownNode.frontmatter.order,
    series: markdownNode => markdownNode.frontmatter.series,
    toSlug: series => kebabCase(series)
  },
  render: {
    mode: "inline",
    placeholder: "bottom",
    template: DefaultTemplate,
    useLandingPage: false
  }
};

/**
 * Checks the type matches.
 * @param {string} type The expected type.
 * @param {string} name The name of the property.
 * @param {*} value The value of the property.
 */
function assertType(type, name, value) {
  if (typeof value !== type) {
    throw new Error(`${name} must be of type ${type}`);
  }
}

/**
 * Resolves the plug-in options to be used.
 * @param {PluginOptions} pluginOptions The user defined options.
 * @returns {PluginOptions} The resolved options.
 */
export function resolveOptions(pluginOptions) {
  const options = defaultsDeep({}, pluginOptions, DefaultOptions);

  assertType("string", "mode", options.render.mode);
  assertType("string", "placeholder", options.render.placeholder);
  assertType("function", "template", options.render.template);
  assertType("boolean", "useLandingPage", options.render.useLandingPage);

  options.render.mode = options.render.mode.toLowerCase();
  options.render.placeholder = options.render.placeholder.toLowerCase();

  assertType("function", "slug", options.resolvers.slug);
  assertType("function", "date", options.resolvers.date);
  assertType("function", "draft", options.resolvers.draft);
  assertType("function", "order", options.resolvers.order);
  assertType("function", "series", options.resolvers.series);
  assertType("function", "toSlug", options.resolvers.toSlug);

  if (options.render.useLandingPage === true) {
    assertType(
      "string",
      "landingPageComponent",
      options.render.landingPageComponent
    );

    if (options.render.landingPagePathPrefix != null) {
      assertType(
        "string",
        "landingPagePathPrefix",
        options.render.landingPagePathPrefix
      );
    }
  }

  return options;
}

/**
 * Resolves the series path (slug).
 * @param {string} name The name of the series.
 * @param {string} [pathPrefix] The global path prefix to be used.
 * @param {string} [pluginPathPrefix] The plugin defined path prefix to be used.
 * @returns {string} The resolved series path (slug).
 */
export function resolveSeriesPath(name, pathPrefix, pluginPathPrefix) {
  const path = [];

  assertType("string", "name", name);

  if (typeof pathPrefix === "string") {
    const cleanPathPrefix = pathPrefix.replace(/^\/|\/$/g, "");
    if (cleanPathPrefix.trim().length > 0) {
      path.push(cleanPathPrefix);
    }
  }

  if (typeof pluginPathPrefix === "string") {
    const cleanpluginPathPrefix = pluginPathPrefix.replace(/^\/|\/$/g, "");
    if (cleanpluginPathPrefix.trim().length > 0) {
      path.push(cleanpluginPathPrefix);
    }
  }

  path.push(name.replace(/^\/|\/$/g, ""));

  return `/${path.join("/")}`;
}

/**
 * Sorts the items in a series.
 * Items are sorted by order, falling back to date then title.
 * @param {SeriesItem} left The left item to be sorted.
 * @param {SeriesItem} right The right item to be sorted.
 * @returns {number} The sorted resolution.
 */
export function sortItems(left, right) {
  const orderLeft = left.order !== null ? Number(left.order) : NaN;
  const orderRight = right.order !== null ? Number(right.order) : NaN;

  if (isNaN(orderLeft) || isNaN(orderRight)) {
    if (!isNaN(orderLeft)) return -1;
    if (!isNaN(orderRight)) return 1;
  } else if (orderLeft !== orderRight) {
    return orderLeft - orderRight;
  }

  const dateLeft =
    left.date !== null ? new Date(left.date) : new Date(undefined);
  const dateRight =
    right.date !== null ? new Date(right.date) : new Date(undefined);

  if (isNaN(dateLeft.getTime()) || isNaN(dateRight.getTime())) {
    if (!isNaN(dateLeft.getTime())) return -1;
    if (!isNaN(dateRight.getTime())) return 1;
  } else if (dateLeft.getTime() !== dateRight.getTime()) {
    return dateLeft.getTime() - dateRight.getTime();
  }

  if (left.title == null || right.title == null) {
    if (left.title != null) return -1;
    if (right.title != null) return 1;
    return 0;
  }

  return left.title.localeCompare(right.title);
}
