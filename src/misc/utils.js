import kebabCase from "lodash.kebabcase";
import defaultsDeep from "lodash.defaultsdeep";

/**
 * Default external template.
 * @param {SeriesContext} context the context to be used.
 * @return {string} the external template.
 */
const ExternalTemplate = context => {
  return `
<div class="series--external-toc">
  <p>This post is part of the <a href="${context.slug}">${
    context.name
  }</a> series</p>
</div>
`.trim();
};

/**
 * Default internal template.
 * @param {SeriesContext} context the context to be used.
 * @return {string} the internal template.
 */
const InlineTemplate = context => {
  const html = context.items.reduce((code, item) => {
    const inner =
      item.draft === true
        ? `<a href="${item.slug}">${item.title}</a>`
        : item.title;

    return `${code}<li>${inner}</li>`.trim();
  }, "");

  return `
<div class="series--inline-toc">
  <div>Other posts in the ${context.name} series</div>
  <ol>
    ${html}
  </ol>
</div>
  `.trim();
};

/**
 * Default options for the series.
 */
const DefaultOptions = {
  slug: markdownNode => markdownNode.frontmatter.slug,
  date: markdownNode => markdownNode.frontmatter.date,
  draft: markdownNode => markdownNode.frontmatter.draft,
  order: markdownNode => markdownNode.frontmatter.order,
  series: markdownNode => markdownNode.frontmatter.series,
  toSlug: series => kebabCase(series),
  render: {
    mode: "inline",
    placeholder: "bottom"
  }
};

/**
 * Checks the type matches.
 * @param {string} type the expected type.
 * @param {string} name the name of the property.
 * @param {*} value the value of the property.
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

  options.render.mode = options.render.mode.toLowerCase();
  options.render.placeholder = options.render.placeholder.toLowerCase();
  options.render.template =
    options.render.template || options.render.mode === "external"
      ? ExternalTemplate
      : InlineTemplate;

  assertType("function", "slug", options.slug);
  assertType("function", "date", options.date);
  assertType("function", "draft", options.draft);
  assertType("function", "order", options.order);
  assertType("function", "series", options.series);
  assertType("function", "toSlug", options.toSlug);
  assertType("function", "template", options.render.template);

  if (options.render.mode === "external") {
    assertType("string", "externalLayout", options.render.externalLayout);

    if (options.render.pathPrefix != null) {
      assertType("string", "pathPrefix", options.render.pathPrefix);
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
