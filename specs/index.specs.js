import { readFile } from "fs";
import { promisify } from "util";

import Remark from "remark";
import grayMatter from "gray-matter";

import plugin from "../src/index";

describe("gatsby-remark-series", () => {
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

  test.each([undefined, null])(
    "resolves options before sending to generate-toc",
    async () => {
      const seriesMarkdown = await readFilePromise(
        "./specs/files/series.md",
        "utf-8"
      );

      const markdownAST = remark.parse(seriesMarkdown.trim());
      const countPrePlugin = markdownAST.children.length;

      const postMarkdownAST = plugin({
        createContentDigest,
        getNodes,
        markdownAST,
        markdownNode: { frontmatter: grayMatter(seriesMarkdown.trim()).data },
        reporter
      });

      expect(countPrePlugin).not.toBe(postMarkdownAST.children.length);
      expect(postMarkdownAST).toMatchSnapshot();
      expect(postMarkdownAST.children[4].type).toBe("html");
      expect(postMarkdownAST.children[4].value).toContain(
        "series-table-of-content"
      );
    }
  );

  test("passes options to generate-toc", async () => {
    const seriesMarkdown = await readFilePromise(
      "./specs/files/series.md",
      "utf-8"
    );

    const markdownAST = remark.parse(seriesMarkdown.trim());
    const countPrePlugin = markdownAST.children.length;

    const postMarkdownAST = plugin(
      {
        createContentDigest,
        getNodes,
        markdownAST,
        markdownNode: { frontmatter: grayMatter(seriesMarkdown.trim()).data },
        reporter
      },
      { render: { placeholder: "top" } }
    );

    expect(countPrePlugin).not.toBe(postMarkdownAST.children.length);
    expect(postMarkdownAST).toMatchSnapshot();
    expect(postMarkdownAST.children[0].type).toBe("html");
    expect(postMarkdownAST.children[0].value).toContain(
      "series-table-of-content"
    );
  });
});
