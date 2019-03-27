import kebabCase from "lodash.kebabcase";
import defaultsDeep from "lodash.defaultsdeep";

/**
 * Default template.
 * @param {TemplateContext} context The context to be used.
 * @returns {string} The default template.
 */
const DefaultTemplate = context => {
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
const DefaultOptions = {
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
 * @returns {void}
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

  if (typeof pathPrefix === "string" && pathPrefix.trim().length > 0) {
    path.push(pathPrefix);
  }

  if (
    typeof pluginPathPrefix === "string" &&
    pluginPathPrefix.trim().length > 0
  ) {
    path.push(pluginPathPrefix);
  }

  path.push(name);

  return `/${path.join("/")}`;
}
