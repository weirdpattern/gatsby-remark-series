---
title: "Standardizing the checkbox and radio buttons using CSS (and only CSS)"
style: "post"
image: "../../../images/web.jpg"
abstract: "Learn how to standardize the checkbox and radio buttons using CSS."
date: "2019-03-18"
author: "ptrevino"
draft: true
series: "browsers"
category: "web"
tags:
  - web
  - css
  - ui
  - components
  - checkbox
  - radio button
---

{
options: {
// Identifies a boolean frontmatter field that tells the plug-in
// the article is still in progress.
//
// Drafts are rendered in plain text (no links).
//
// Default: 'draft'
// Optional
draftField: 'draft',

    // Identifies a numeric frontmatter field that indicates the series order.
    // When this is not specified, then the order is determine by the position
    // in the content tree.
    //
    // Default: 'order'
    // Optional
    orderField: 'order',

    // Identifies a string frontmatter field that indicates the name of the series.
    //
    // Default: 'series'
    // Optional
    seriesField: '',

    render: {
      // Inline, renders the toc in the file.
      // External, creates an external page with the content.
      //
      // Default: 'inline'
      // Optional
      mode: 'inline' | 'external',

      // The template to be used.
      // Uses tokens to indicate the insertion points.
      //
      // Default: (depends on mode used)
      // Optional
      template: string,

      // Exclusive for inline
      // Where do you want the toc to be rendered.
      //
      // Default: 'top'
      // Optional
      placeholder: 'top' | 'bottom' | 'both',

      // Exclusive for external
      // Prefixes paths with this string (e.g. <url>/series/series-name)
      //
      // Default: null
      // Optional
      pathPrefix: string,

      // Exclusive for external
      // The path to the layout file to be used to render the table of contents.
      //
      // Default: null
      // Required
      externalLayout: string
    }

}
}
