import { Collection, Icon } from "@aster/core";
import { benchmarkCatalogueFixture } from "../constants/benchmark-catalogue-fixture.constant.mjs";

/**
 * @description Creates a fixed synthetic catalogue for cross-package performance evidence.
 * @remarks The fixture is independent from product artwork so ordinary catalogue growth cannot alter historical measurements.
 */
export class BenchmarkCatalogueFixtureFactory {
  /**
   * @description Creates one deeply immutable benchmark catalogue through public Core APIs.
   * @returns {import("../contracts/internal/benchmark-catalogue-fixture.contract.mjs").IBenchmarkCatalogueFixture} Stable synthetic catalogue values.
   */
  create() {
    const icons = Object.freeze(
      Array.from(
        { length: benchmarkCatalogueFixture.corpusSize },
        (_, index) => this.#icon(index),
      ),
    );
    const collection = Collection.define({
      identity: { name: "benchmark" },
      icons,
      metadata: {
        displayName: "Benchmark",
        description: "Stable synthetic performance corpus.",
        tags: ["benchmark"],
      },
    });
    const snapshot = Object.freeze({
      icons: Object.freeze(
        icons.map((definition) =>
          Object.freeze({
            definition,
            memberships: Object.freeze([collection.identity]),
          }),
        ),
      ),
      collections: Object.freeze([Object.freeze({ definition: collection })]),
    });
    const icon = icons[0];

    if (icon === undefined) {
      throw new TypeError("The benchmark catalogue requires one icon.");
    }

    return Object.freeze({ icon, icons, collection, snapshot });
  }

  /**
   * @description Creates one canonical definition from a deterministic geometry family.
   * @param {number} index - Zero-based corpus position.
   * @returns {import("@aster/core").IconDefinition} Canonical synthetic icon.
   */
  #icon(index) {
    const ordinal = index + 1;

    return Icon.define({
      identity: {
        namespace: "benchmark",
        name: `fixture-${String(ordinal).padStart(2, "0")}`,
      },
      viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
      nodes: this.#nodes(index),
      metadata: {
        displayName: `Benchmark Fixture ${ordinal}`,
        tags: ["benchmark", `fixture-${ordinal}`],
        rtl: "preserve",
        presentation: {
          defaults: {
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
            strokeLineCap: "round",
            strokeLineJoin: "round",
          },
          overrides: [],
          defaultSize: 24,
        },
        deprecated: false,
      },
    });
  }

  /**
   * @description Selects one deterministic geometry family for a corpus position.
   * @param {number} index - Zero-based corpus position.
   * @returns {import("@aster/core").IconNodeType[]} Mutable authored nodes consumed immediately by Core.
   */
  #nodes(index) {
    const offset = index % 4;

    switch (offset) {
      case 0:
        return [{ kind: "circle", cx: 12, cy: 12, radius: 3 + (index % 6) }];
      case 1:
        return [{ kind: "path", data: `M${2 + (index % 3)} 12h${16 - (index % 3)}` }];
      case 2:
        return [
          { kind: "line", x1: 3, y1: 12, x2: 21, y2: 12 },
          {
            kind: "polyline",
            points: [
              { x: 9, y: 6 },
              { x: 3, y: 12 },
              { x: 9, y: 18 },
            ],
          },
        ];
      default:
        return [
          {
            kind: "rect",
            x: 4,
            y: 5,
            width: 16,
            height: 14,
            radiusX: 2,
            radiusY: 2,
          },
          { kind: "ellipse", cx: 12, cy: 12, radiusX: 5, radiusY: 3 },
        ];
    }
  }
}
