import { readFile } from "fs";
import { promisify } from "util";

import Remark from "remark";
import grayMatter from "gray-matter";
import defaultsDeep from "lodash.defaultsdeep";

import plugin from "../src/index";
import { DefaultOptions } from "../src/utils";

describe("gatsby-remark-series/remark", () => {
  const reporter = {
    panic: message => {
      throw new Error(message);
    }
  };

  const remark = new Remark().data("settings", {
    commonmark: true,
    footnotes: true,
    pedantic: true
  });

  const createContentDigest = () => {
    return Math.random()
      .toString(36)
      .substring(7);
  };

  const getNodes = () => {
    return [
      {
        internal: {
          type: "MarkdownRemark"
        },
        frontmatter: {
          title: "My Title 2",
          date: "2019-01-01",
          series: "My Title Series"
        }
      },
      { internal: { type: "other" } },
      {
        internal: {
          type: "MarkdownRemark"
        },
        frontmatter: {
          title: "My Title 3",
          date: "2019-02-01",
          series: "My Title Series"
        }
      },
      {
        internal: {
          type: "MarkdownRemark"
        },
        frontmatter: {
          title: "My Title",
          date: "2019-01-01",
          series: "Other Series"
        }
      },
      { internal: { type: "other" } }
    ];
  };

  const readFilePromise = promisify(readFile);

  const getSeriesMarkdown = async (file, options, pathPrefix) => {
    const seriesMarkdown = await readFilePromise(file, "utf-8");
    const markdownAST = remark.parse(seriesMarkdown.trim());
    const countPrePlugin = markdownAST.children.length;

    const postMarkdownAST = plugin(
      {
        createContentDigest,
        getNodes,
        markdownAST,
        markdownNode: { frontmatter: grayMatter(seriesMarkdown.trim()).data },
        pathPrefix,
        reporter
      },
      options
    );

    return [postMarkdownAST, countPrePlugin];
  };

  test("returns the exact AST when no series is detected", async () => {
    const noSeriesMarkdown = await readFilePromise(
      "./specs/files/no-series.md",
      "utf-8"
    );

    const markdownAST = remark.parse(noSeriesMarkdown.trim());
    const countPrePlugin = markdownAST.children.length;

    const postMarkdownAST = plugin(
      {
        createContentDigest,
        markdownAST,
        markdownNode: { frontmatter: grayMatter(noSeriesMarkdown.trim()).data },
        reporter
      },
      DefaultOptions
    );

    expect(countPrePlugin).toBe(postMarkdownAST.children.length);
    expect(postMarkdownAST).toMatchSnapshot();
  });

  test("returns a modified version of the AST when series is detected", async () => {
    const [postMarkdownAST, countPrePlugin] = await getSeriesMarkdown(
      "./specs/files/series.md",
      DefaultOptions
    );

    expect(countPrePlugin).not.toBe(postMarkdownAST.children.length);
    expect(postMarkdownAST).toMatchSnapshot();
  });

  test("replaces children's value when dynamic placeholder is used", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series-dynamic.md",
      defaultsDeep({ render: { placeholder: "<!-- TOC -->" } }, DefaultOptions)
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      "series-table-of-content"
    );
  });

  test("adds a children on top of the AST's children when top placeholder is used", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep({ render: { placeholder: "top" } }, DefaultOptions)
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[0].type).toBe("html");
    expect(postMarkdownAST.children[0].value).toContain(
      "series-table-of-content"
    );
  });

  test("adds a children on bottom of the AST's children when bottom placeholder is used", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep({ render: { placeholder: "bottom" } }, DefaultOptions)
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      "series-table-of-content"
    );
  });

  test("renders inline toc references", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep({ render: { useLandingPage: false } }, DefaultOptions)
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      "Other posts in the My Title Series series"
    );
  });

  test("renders external toc references", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep(
        {
          render: {
            useLandingPage: true,
            landingPageComponent: "path"
          }
        },
        DefaultOptions
      )
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      'This post is part of the <a href="/my-title-series">My Title Series</a>'
    );
  });

  test("uses the pluginPathPrefix in external toc", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep(
        {
          render: {
            useLandingPage: true,
            landingPageComponent: "path",
            landingPagePathPrefix: "series"
          }
        },
        DefaultOptions
      )
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      'This post is part of the <a href="/series/my-title-series">My Title Series</a>'
    );
  });

  test("uses the pathPrefix in external toc", async () => {
    const [postMarkdownAST] = await getSeriesMarkdown(
      "./specs/files/series.md",
      defaultsDeep(
        {
          render: {
            useLandingPage: true,
            landingPageComponent: "path",
            landingPagePathPrefix: "series"
          }
        },
        DefaultOptions
      ),
      "blog"
    );

    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[4].type).toBe("html");
    expect(postMarkdownAST.children[4].value).toContain(
      'This post is part of the <a href="/blog/series/my-title-series">My Title Series</a>'
    );
  });
});
