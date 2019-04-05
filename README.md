# gatsby-remark-series

This plugin dynamically creates and updates table of content (toc) for all
articles in a series.

## Installation

`yarn add gatsby-remark-series`

## Usage

In your gatsby-config.js file

```javascript
{
  resolve: "gatsby-transformer-remark",
  options: {
    plugins: [
      {
        resolve: "gatsby-remark-series",
        options: {
          render: {
            // The location where the toc should be rendered.
            // Default: bottom
            // Optional
            placeholder: "both" | "top" | "bottom" | string,

            // Provides a way to customize the output of the toc.
            // Default: check utils/DefaultTemplate for details
            // Optional
            template: (templateContext) => string,

            // Indicates a landing page is required.
            // This will render the toc using template and will generate
            // a landing page for the series with all articles listed.
            // Default: false
            // Optional
            useLandingPage: boolean,

            // This can only be used in conjunction with useLandingPage=true.
            // Provides a way to specify a prefix for the slug of the series.
            // This prefix is independent of the pathPrefix provided by gatsby.
            // Default: null
            // Optional
            landingPagePathPrefix: string,

            // This can only be used in conjunction with useLandingPage=true.
            // Provides the path to the template layout (react component)
            // to be used to render the external toc.
            // This component receives the series articles in the pageContext.
            // For more information please refer to examples/series.jsx
            // Defaults: null
            // Required!
            landingPageComponent: string
          },
          resolvers: {
            // Locates and resolves the slug on the node.
            // Default: node.frontmatter.slug
            // Returns: string
            // Optional
            slug: (markdownNode) => string,

            // Locates and resolves the date on the node.
            // Default: node.frontmatter.date
            // Returns: string
            // Optional
            date: (markdownNode) => string,

            // Locates and resolves the draft flag on the node.
            // Indicates the post is a draft, default behavior is to show the title,
            // but without a link to the post. This can be overridden with a new template.
            // Default: node.frontmatter.draft
            // Returns: boolean
            // Optional
            draft: (markdownNode) => boolean,

            // Locates and resolves the order on the node.
            // Indicates the position of the post in the series.
            // Default: node.frontmatter.order
            // Returns: number
            // Optional
            order: (markdownNode) => number,

            // Locates and resolves the name of the series on the node.
            // Default: node.frontmatter.series
            // Returns: string
            // Optional
            series: (markdownNode) => string,

            // Takes a string and converts it to a slug representation.
            // This is used to calculate the path for the external landing page.
            // In theory, should match the algorithm you are using to generate
            // your urls.
            // Default: converts the string to kebab-case using lodash.kebabCase.
            toSlug: (markdownNode) => string
          }
        }
      }
    ]
  }
}
```

In your markdown files

```markdown
---
title: **article title**
series: **series name**
order: **number**
draft: **true | false**
---

<!-- **placeholder** -->
```

Notes:

1. **series** is required to identify the articles.
2. **order** and **draft** are optional, just in case you want to reorder things
   or make people aware there are more articles coming.
3. A `<!-- placeholder -->` is only required when the `render.placeholder` setting
   has a value other than both, top or bottom. In those case, the placeholder has to
   be expressed as a comment in the code using `<!--` and `-->`.

## Examples

Given the following configuration

```javascript
{
  resolve: "gatsby-transformer-remark",
  options: {
    plugins: [
      {
        resolve: "gatsby-remark-series",
        render: {
          placeholder: "toc"
        }
      }
    ]
  }
}
```

Will turn this

```markdown
---
title: My Title
series: CSS and HTML tricks
---

# My Title

<!-- toc -->

Content
```

Into this (approximately)

```html
<h1>My Title</h1>

<div class="series-table-of-content">
  <div>Other posts in the CSS and HTML tricks series</div>
  <ol>
    <li><a href="/my-title">My Title</a></li>
    <!-- more <li> with all articles that match the series name -->
  </ol>
</div>

<p>Content</p>
```

## Notes

1. The plugin does not provide any default styling for the toc.
2. The plugin does not provide a default layout for series landing pages, but
   it provides a concrete example in examples/series.jsx

## License

MIT, by Patricio Trevino
