import {
  DefaultOptions,
  resolveOptions,
  resolveSeriesPath,
  sortItems
} from "../src/utils";

describe("utils", () => {
  const reporter = {
    panic: message => {
      throw new Error(message);
    }
  };

  describe("resolveOptions", () => {
    test.each([undefined, null, {}])(
      "default options are returned when plugins options aren't passed",
      pluginOptions => {
        const resolved = resolveOptions(pluginOptions, reporter);
        const node = {
          frontmatter: {
            slug: "Test Slug",
            date: "01/01/2019",
            draft: false,
            order: 1,
            series: "Test Series"
          }
        };

        expect(resolved).toEqual(DefaultOptions);
        expect(resolved.resolvers.slug(node)).toBe(
          DefaultOptions.resolvers.slug(node)
        );

        expect(resolved.resolvers.date(node)).toBe(
          DefaultOptions.resolvers.date(node)
        );

        expect(resolved.resolvers.draft(node)).toBe(
          DefaultOptions.resolvers.draft(node)
        );

        expect(resolved.resolvers.order(node)).toBe(
          DefaultOptions.resolvers.order(node)
        );

        expect(resolved.resolvers.series(node)).toBe(
          DefaultOptions.resolvers.series(node)
        );

        expect(resolved.resolvers.toSlug(node)).toBe(
          DefaultOptions.resolvers.toSlug(node)
        );

        expect(resolved.render.placeholder).toBe(
          DefaultOptions.render.placeholder
        );

        expect(resolved.render.useLandingPage).toBe(
          DefaultOptions.render.useLandingPage
        );
      }
    );

    test.each([
      [{ placeholder: 1 }, "placeholder must be of type string"],
      [{ template: "" }, "template must be of type function"],
      [{ useLandingPage: "no" }, "useLandingPage must be of type boolean"]
    ])("throws error when a type in render doesn't match", (value, message) => {
      const render = Object.assign(
        {
          placeholder: "bottom",
          template: () => {},
          useLandingPage: false
        },
        value
      );

      expect(() => resolveOptions({ render }, reporter)).toThrow(message);
    });

    test.each([
      [{ slug: "slug" }, "slug must be of type function"],
      [{ date: "date" }, "date must be of type function"],
      [{ draft: "draft" }, "draft must be of type function"],
      [{ order: "order" }, "order must be of type function"],
      [{ series: "series" }, "series must be of type function"],
      [{ toSlug: "toSlug" }, "toSlug must be of type function"]
    ])(
      "throws error when a type in resolvers doesn't match",
      (value, message) => {
        const resolvers = Object.assign(
          {
            slug: () => {},
            date: () => {},
            draft: () => {},
            order: () => {},
            series: () => {},
            toSlug: () => {}
          },
          value
        );

        expect(() => resolveOptions({ resolvers }, reporter)).toThrow(message);
      }
    );

    test.each([
      [
        { landingPageComponent: 1 },
        "landingPageComponent must be of type string"
      ],
      [
        { landingPagePathPrefix: 1 },
        "landingPagePathPrefix must be of type string"
      ]
    ])(
      "throws error when useLandingPage is true and a setting doesn't match",
      (value, message) => {
        const render = Object.assign(
          {
            useLandingPage: true,
            landingPageComponent: "path",
            landingPagePathPrefix: "series"
          },
          value
        );

        expect(() => resolveOptions({ render }, reporter)).toThrow(message);
      }
    );

    test.each([{ landingPageComponent: 1 }, { landingPagePathPrefix: 1 }])(
      "doesn't throw when useLandingPage is false and a setting doesn't match",
      value => {
        const render = Object.assign(
          {
            useLandingPage: false,
            landingPageComponent: "path",
            landingPagePathPrefix: "series"
          },
          value
        );

        expect(() => resolveOptions({ render }, reporter)).not.toThrow();
      }
    );

    test.each([
      [true, null],
      [true, undefined],
      [false, null],
      [false, undefined]
    ])(
      "doesn't throw when landingPagePathPrefix is null or undefined",
      (useLandingPage, landingPagePathPrefix) => {
        expect(() =>
          resolveOptions({
            render: {
              useLandingPage,
              landingPagePathPrefix,
              landingPageComponent: "path"
            },
            reporter
          })
        ).not.toThrow();
      }
    );
  });

  describe("resolveSeriesPath", () => {
    test.each([null, undefined, 1, true, {}, [], () => {}, Symbol.for("A")])(
      "throws when name is not a string",
      name => {
        expect(() =>
          resolveSeriesPath(name, "pathPrefix", "pluginPathPrefix", reporter)
        ).toThrow("name must be of type string");
      }
    );

    test("uses name, pathPrefix and pluginPathPrefix when available", () => {
      expect(
        resolveSeriesPath("name", "pathPrefix", "pluginPathPrefix", reporter)
      ).toBe("/pathPrefix/pluginPathPrefix/name");
    });

    test.each([null, undefined, 1, true, {}, [], () => {}, Symbol.for("A")])(
      "ignores non strings in pathPrefix",
      pathPrefix => {
        expect(
          resolveSeriesPath("name", pathPrefix, "pluginPathPrefix", reporter)
        ).toBe("/pluginPathPrefix/name");
      }
    );

    test("ignores empty strings in pathPrefix", () => {
      expect(resolveSeriesPath("name", "", "pluginPathPrefix", reporter)).toBe(
        "/pluginPathPrefix/name"
      );
    });

    test.each(["/pathPrefix", "pathPrefix/", "/pathPrefix/"])(
      "strips leading and trailing / in pathPrefix",
      pathPrefix => {
        expect(
          resolveSeriesPath("name", pathPrefix, "pluginPathPrefix", reporter)
        ).toBe("/pathPrefix/pluginPathPrefix/name");
      }
    );

    test.each([null, undefined, 1, true, {}, [], () => {}, Symbol.for("A")])(
      "ignores non strings in pluginPathPrefix",
      pluginPathPrefix => {
        expect(
          resolveSeriesPath("name", "pathPrefix", pluginPathPrefix, reporter)
        ).toBe("/pathPrefix/name");
      }
    );

    test("ignores empty strings in pluginPathPrefix", () => {
      expect(resolveSeriesPath("name", "pathPrefix", "", reporter)).toBe(
        "/pathPrefix/name"
      );
    });

    test.each(["/pluginPathPrefix", "pluginPathPrefix/", "/pluginPathPrefix/"])(
      "strips leading and trailing / in pluginPathPrefix",
      pluginPathPrefix => {
        expect(
          resolveSeriesPath("name", "pathPrefix", pluginPathPrefix, reporter)
        ).toBe("/pathPrefix/pluginPathPrefix/name");
      }
    );
  });

  describe("sortItems", () => {
    test("sorts by order when order exists", () => {
      const list = [{ order: 4 }, { order: 2 }, { order: 3 }, { order: 1 }];

      list.sort(sortItems);

      expect(list).toEqual([
        { order: 1 },
        { order: 2 },
        { order: 3 },
        { order: 4 }
      ]);
    });

    test("handles invalid values for order", () => {
      const list = [
        { order: "a" },
        { order: null },
        { order: undefined },
        { order: 1 }
      ];

      list.sort(sortItems);

      expect(list).toEqual([
        { order: 1 },
        { order: "a" },
        { order: null },
        { order: undefined }
      ]);
    });

    test("sorts by date when date exists", () => {
      const list = [
        { date: "2019/12/01" },
        { date: "2019/01/01" },
        { date: "2019/04/01" },
        { date: "2019/02/01" }
      ];

      list.sort(sortItems);

      expect(list).toEqual([
        { date: "2019/01/01" },
        { date: "2019/02/01" },
        { date: "2019/04/01" },
        { date: "2019/12/01" }
      ]);
    });

    test("handles invalid values for date", () => {
      const list = [
        { date: "1" },
        { date: null },
        { date: "2019/01/01" },
        { date: undefined }
      ];

      list.sort(sortItems);

      expect(list).toEqual([
        { date: "1" },
        { date: "2019/01/01" },
        { date: null },
        { date: undefined }
      ]);
    });

    test("sorts by title when title exists", () => {
      const list = [
        { title: "Wendy" },
        { title: "Albert" },
        { title: "Paul" },
        { title: "Abraham" },
        { title: "Cindy" }
      ];

      list.sort(sortItems);

      expect(list).toEqual([
        { title: "Abraham" },
        { title: "Albert" },
        { title: "Cindy" },
        { title: "Paul" },
        { title: "Wendy" }
      ]);
    });

    test("handles invalid values for title", () => {
      const list = [
        { title: "Wendy" },
        { title: null },
        { title: undefined },
        { title: "Charles" }
      ];

      list.sort(sortItems);

      expect(list).toEqual([
        { title: "Charles" },
        { title: "Wendy" },
        { title: null },
        { title: undefined }
      ]);
    });

    test.each([
      [
        [
          { order: 4, date: "2019/01/01", title: "Charles" },
          { order: 2, date: "2019/12/01", title: "Abraham" },
          { order: 3, date: "2019/02/01", title: "Cindy" },
          { order: 1, date: "2019/04/01", title: "Wendy" }
        ],
        [
          { order: 1, date: "2019/04/01", title: "Wendy" },
          { order: 2, date: "2019/12/01", title: "Abraham" },
          { order: 3, date: "2019/02/01", title: "Cindy" },
          { order: 4, date: "2019/01/01", title: "Charles" }
        ]
      ],
      [
        [
          { order: 1, date: "2019/01/01", title: "Charles" },
          { order: 1, date: "2019/12/01", title: "Abraham" },
          { order: 1, date: "2019/02/01", title: "Cindy" },
          { order: 1, date: "2019/04/01", title: "Wendy" }
        ],
        [
          { order: 1, date: "2019/01/01", title: "Charles" },
          { order: 1, date: "2019/02/01", title: "Cindy" },
          { order: 1, date: "2019/04/01", title: "Wendy" },
          { order: 1, date: "2019/12/01", title: "Abraham" }
        ]
      ],
      [
        [
          { order: 1, date: "2019/01/01", title: "Charles" },
          { order: 1, date: "2019/01/01", title: "Abraham" },
          { order: 1, date: "2019/01/01", title: "Cindy" },
          { order: 1, date: "2019/01/01", title: "Wendy" }
        ],
        [
          { order: 1, date: "2019/01/01", title: "Abraham" },
          { order: 1, date: "2019/01/01", title: "Charles" },
          { order: 1, date: "2019/01/01", title: "Cindy" },
          { order: 1, date: "2019/01/01", title: "Wendy" }
        ]
      ]
    ])("follows sequence: order, date, title", (items, results) => {
      items.sort(sortItems);
      expect(items).toEqual(results);
    });
  });
});
