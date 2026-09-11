import { BenchmarkCatalogueFixtureFactory } from "../../shared/runtime/benchmark-catalogue-fixture.factory.mjs";

/**
 * @description Prepares equivalent mutable and canonical Core benchmark inputs outside timed work.
 */
export class CoreBaselineFixtureFactory {
  /**
   * @description Creates one isolated scenario fixture matrix from a stable synthetic catalogue.
   * @returns {import("../contracts/internal/core-baseline-fixtures.contract.mjs").ICoreBaselineFixtures} Prepared public Core inputs.
   */
  create() {
    const catalogue = new BenchmarkCatalogueFixtureFactory().create();
    const canonicalIcons = catalogue.icons;
    const firstIcon = catalogue.icon;

    return Object.freeze({
      canonicalIcons,
      mutableIcons: this.#clone(canonicalIcons),
      canonicalCollection: catalogue.collection,
      mutableCollection: this.#clone(catalogue.collection),
      emptyCollection: {
        identity: { namespace: "benchmark", name: "empty" },
        icons: [],
        metadata: { displayName: "Benchmark Empty" },
      },
      singleCanonicalCollection: {
        identity: { namespace: "benchmark", name: "single-canonical" },
        icons: [firstIcon],
        metadata: { displayName: "Benchmark Single Canonical" },
      },
      straightPath: this.#pathDefinition("straight", [
        { kind: "move", x: 2, y: 12 },
        { kind: "line", x: 22, y: 12 },
      ]),
      curvedPath: this.#pathDefinition("curved", [
        { kind: "move", x: 2, y: 12 },
        {
          kind: "cubic-bezier",
          x: 12,
          y: 2,
          control1X: 4,
          control1Y: 4,
          control2X: 8,
          control2Y: 2,
        },
        {
          kind: "quadratic-bezier",
          x: 18,
          y: 8,
          controlX: 16,
          controlY: 2,
        },
        {
          kind: "arc",
          x: 22,
          y: 12,
          radiusX: 4,
          radiusY: 4,
          rotation: 0,
          largeArc: false,
          sweep: true,
        },
      ]),
      compoundPath: this.#pathDefinition("compound", [
        { kind: "move", x: 2, y: 2 },
        { kind: "line", x: 10, y: 2 },
        { kind: "line", x: 10, y: 10 },
        { kind: "close" },
        { kind: "move", x: 14, y: 14 },
        { kind: "line", x: 22, y: 14 },
        { kind: "line", x: 22, y: 22 },
        { kind: "close" },
      ]),
    });
  }

  /**
   * @description Creates one mutable structured-path definition for isolated Core measurement.
   * @param {string} name - Stable benchmark identity suffix.
   * @param {import("@aster/core").IconPathCommandType[]} commands - Mutable authored command sequence.
   * @returns {import("@aster/core").IconDefinition} Mutable valid definition input.
   */
  #pathDefinition(name, commands) {
    return {
      identity: { namespace: "benchmark", name: `path-${name}` },
      viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
      nodes: [{ kind: "path", commands }],
      metadata: {
        displayName: `Benchmark Path ${name}`,
        rtl: "preserve",
        presentation: {
          defaults: {
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
          },
          overrides: [],
        },
        deprecated: false,
      },
    };
  }

  /**
   * @description Clones one serialisable portable value into mutable plain data.
   * @param {Value} value - Canonical portable input.
   * @returns {Value} Structurally equivalent mutable clone.
   * @typeParam Value - Portable serialisable value family.
   */
  #clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
}
