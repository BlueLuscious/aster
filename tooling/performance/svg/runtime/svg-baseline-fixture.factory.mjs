import { Icon } from "@aster/core";
import { AsterCollection } from "@aster/icons/collections/aster";

/**
 * @description Prepares representative public SVG definitions and options outside timed work.
 */
export class SvgBaselineFixtureFactory {
  /**
   * @description Creates one immutable SVG scenario fixture matrix.
   * @returns {import("../contracts/internal/svg-baseline-fixtures.contract.mjs").ISvgBaselineFixtures} Prepared public SVG inputs.
   */
  create() {
    const minimalDefinition = this.#definition("minimal", [
      Object.freeze({ kind: "circle", cx: 12, cy: 12, radius: 4 }),
    ]);

    return Object.freeze({
      minimalDefinition,
      primitivesDefinition: this.#definition("primitives", [
        Object.freeze({ kind: "path", data: "M2 12h20" }),
        Object.freeze({ kind: "circle", cx: 12, cy: 12, radius: 4 }),
        Object.freeze({
          kind: "ellipse",
          cx: 12,
          cy: 12,
          radiusX: 6,
          radiusY: 3,
        }),
        Object.freeze({
          kind: "rect",
          x: 4,
          y: 5,
          width: 16,
          height: 14,
          radiusX: 2,
          radiusY: 3,
        }),
        Object.freeze({ kind: "line", x1: 2, y1: 4, x2: 22, y2: 20 }),
        Object.freeze({
          kind: "polyline",
          points: Object.freeze([
            Object.freeze({ x: 2, y: 12 }),
            Object.freeze({ x: 12, y: 2 }),
            Object.freeze({ x: 22, y: 12 }),
          ]),
        }),
        Object.freeze({
          kind: "polygon",
          points: Object.freeze([
            Object.freeze({ x: 12, y: 2 }),
            Object.freeze({ x: 22, y: 20 }),
            Object.freeze({ x: 2, y: 20 }),
          ]),
        }),
      ]),
      corpusDefinitions: AsterCollection.icons,
      overrideDefinition: Icon.define({
        ...minimalDefinition,
        identity: { namespace: "benchmark", name: "overrides" },
        metadata: {
          ...minimalDefinition.metadata,
          displayName: "Benchmark Overrides",
          presentation: {
            ...minimalDefinition.metadata.presentation,
            overrides: ["fill", "stroke", "strokeWidth"],
          },
        },
      }),
      rtlDefinition: Icon.define({
        ...minimalDefinition,
        identity: { namespace: "benchmark", name: "rtl-mirror" },
        viewBox: { minX: -4, minY: 0, width: 24, height: 24 },
        metadata: {
          ...minimalDefinition.metadata,
          displayName: "Benchmark RTL Mirror",
          rtl: "mirror",
        },
      }),
      escapingDefinition: Icon.define({
        ...minimalDefinition,
        identity: { namespace: "benchmark", name: "escaping" },
        nodes: [{ kind: "path", data: 'M2 12h20"<&\t\n\r' }],
        metadata: {
          ...minimalDefinition.metadata,
          displayName: "Benchmark Escaping",
        },
      }),
      pointSequenceDefinition: this.#definition("point-sequence", [
        Object.freeze({
          kind: "polyline",
          points: Object.freeze(
            Array.from({ length: 128 }, (_, index) =>
              Object.freeze({
                x: index / 8,
                y: (index % 16) / 2,
              }),
            ),
          ),
        }),
      ]),
      semanticOptions: Object.freeze({
        label: "Benchmark icon",
        title: "Benchmark title",
      }),
      overrideOptions: Object.freeze({
        colour: "#123",
        fill: "#456",
        stroke: "#789",
        strokeWidth: 2,
        size: 32,
      }),
      rtlOptions: Object.freeze({ direction: "rtl" }),
      escapingOptions: Object.freeze({
        label: 'Benchmark\tlabel\n<&"',
        title: "Benchmark\rtitle<&",
      }),
    });
  }

  /**
   * @description Constructs one canonical benchmark definition with shared presentation policy.
   * @param {string} name - Benchmark-local canonical identity name.
   * @param {import("@aster/core").IconNodeType[]} nodes - Prepared portable geometry nodes.
   * @returns {import("@aster/core").IconDefinition} Canonical frozen definition.
   */
  #definition(name, nodes) {
    return Icon.define({
      identity: { namespace: "benchmark", name },
      viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
      nodes,
      metadata: {
        displayName: `Benchmark ${name}`,
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
}
