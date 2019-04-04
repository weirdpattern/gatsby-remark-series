import { resolve } from "path";

import { DefaultOptions } from "../src/utils";
import { createPages, onCreateNode } from "../src/gatsby-node";

describe("gatsby-remark-series/gatsby-node", () => {
  const reporter = {
    panic: message => {
      throw new Error(message);
    }
  };

  const getNodes = () => {
    return [
      {
        internal: {
          type: "MarkdownRemark",
          contentDigest: "1"
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
          type: "MarkdownRemark",
          contentDigest: "2"
        },
        frontmatter: {
          title: "My Title 3",
          date: "2019-02-01",
          series: "My Title Series"
        }
      },
      {
        internal: {
          type: "MarkdownRemark",
          contentDigest: "3"
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

  describe("createPages", () => {
    test("doesn't do anything when useLandingPage is false", () => {
      const createPage = jest.fn();

      createPages({
        getNodes,
        reporter,
        actions: { createPage }
      });

      expect(createPage).not.toHaveBeenCalled();
    });

    test("createPage is called for each series", () => {
      const createPage = jest.fn();

      createPages(
        {
          getNodes,
          reporter,
          actions: { createPage }
        },
        { render: { useLandingPage: true, landingPageComponent: "path" } }
      );

      expect(createPage).toHaveBeenCalledTimes(2);
    });

    test("createPage is called with the right arguments", () => {
      const createPage = jest.fn();

      createPages(
        {
          getNodes,
          reporter,
          actions: { createPage }
        },
        { render: { useLandingPage: true, landingPageComponent: "path" } }
      );

      expect(createPage).toHaveBeenCalledTimes(2);

      expect(createPage.mock.calls[0]).toEqual([
        {
          path: "/my-title-series",
          component: resolve("path"),
          context: {
            name: "My Title Series",
            items: getNodes()
              .filter(
                node =>
                  node.internal.type === "MarkdownRemark" &&
                  node.frontmatter.series === "My Title Series"
              )
              .map(node => ({
                title: node.frontmatter.title,
                slug: DefaultOptions.resolvers.slug(node),
                date: DefaultOptions.resolvers.date(node),
                draft: DefaultOptions.resolvers.draft(node),
                order: DefaultOptions.resolvers.order(node),
                series: "My Title Series"
              }))
          }
        }
      ]);

      expect(createPage.mock.calls[1]).toEqual([
        {
          path: "/other-series",
          component: resolve("path"),
          context: {
            name: "Other Series",
            items: getNodes()
              .filter(
                node =>
                  node.internal.type === "MarkdownRemark" &&
                  node.frontmatter.series === "Other Series"
              )
              .map(node => ({
                title: node.frontmatter.title,
                slug: DefaultOptions.resolvers.slug(node),
                date: DefaultOptions.resolvers.date(node),
                draft: DefaultOptions.resolvers.draft(node),
                order: DefaultOptions.resolvers.order(node),
                series: "Other Series"
              }))
          }
        }
      ]);
    });

    test("throws exception when landingPageComponent is not passed as argument", () => {
      const createPage = jest.fn();

      expect(() =>
        createPages(
          {
            getNodes,
            reporter,
            actions: { createPage }
          },
          { render: { useLandingPage: true } }
        )
      ).toThrow("landingPageComponent must be of type string");
    });
  });

  describe("onCreateNode", () => {
    const createContentDigest = () => {
      return Math.random()
        .toString(36)
        .substring(7);
    };

    test("doesn't do anything when internal.type is not MarkdownRemark", () => {
      const node = {
        internal: {
          type: "other",
          contentDigest: "a"
        }
      };

      onCreateNode({
        node,
        getNodes,
        createContentDigest
      });

      expect(node.internal.contentDigest).toBe("a");
    });

    test("updates contentDigest for MarkdownRemark items in the same series", () => {
      const nodes = getNodes();
      const node = nodes[0];

      onCreateNode({
        node,
        getNodes,
        createContentDigest
      });

      const sibling = nodes[2];
      expect(sibling.contentDigest).not.toBe("2");
    });
  });
});
