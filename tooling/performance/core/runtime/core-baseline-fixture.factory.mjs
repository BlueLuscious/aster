import { Icon } from "@luscious-garden/aster-core";
import { BenchmarkCatalogueFixtureFactory } from "../../shared/runtime/benchmark-catalogue-fixture.factory.mjs";
import { coreBaseline } from "../constants/core-baseline.constant.mjs";

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
    const scaledIcons = Object.freeze(Array.from(
      { length: coreBaseline.collectionSizes.large },
      (_, index) => this.#scaledIcon(canonicalIcons, index),
    ));
    const representativeCollection = this.#scaledCollection(
      scaledIcons.slice(0, coreBaseline.collectionSizes.representative),
      "representative",
    );

    return Object.freeze({
      canonicalIcons,
      mutableIcons: this.#clone(canonicalIcons),
      canonicalCollection: catalogue.collection,
      mutableCollection: this.#clone(catalogue.collection),
      emptyCollection: {
        identity: { namespace: "benchmark", name: "empty" },
        icons: {},
        metadata: { displayName: "Benchmark Empty" },
      },
      singleCanonicalCollection: {
        identity: { namespace: "benchmark", name: "single-canonical" },
        icons: { fixture1: firstIcon },
        metadata: { displayName: "Benchmark Single Canonical" },
      },
      representativeMutableCollection: this.#clone(representativeCollection),
      representativeCanonicalCollection: representativeCollection,
      largeCanonicalCollection: this.#scaledCollection(scaledIcons, "large"),
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
   * @description Creates one canonical scaled icon with a distinct identity and varied corpus geometry.
   * @param {readonly import("@luscious-garden/aster-core").IconDefinition[]} corpus - Prepared fixed geometry corpus.
   * @param {number} index - Zero-based scaled icon position.
   * @returns {import("@luscious-garden/aster-core").IconDefinition} Canonical scaled icon.
   */
  #scaledIcon(corpus, index) {
    const source = corpus[index % corpus.length];

    if (source === undefined) {
      throw new TypeError("The Core scale scenario requires prepared icons.");
    }

    return Icon.define({
      ...source,
      identity: {
        namespace: "benchmark",
        name: `scale-${String(index + 1).padStart(3, "0")}`,
      },
      metadata: {
        ...source.metadata,
        displayName: `Scale Fixture ${index + 1}`,
      },
    });
  }

  /**
   * @description Prepares an authored dictionary without precomputing its derived member view.
   * @param {readonly import("@luscious-garden/aster-core").IconDefinition[]} icons - Canonical scaled icons in authored order.
   * @param {string} name - Stable benchmark collection identity.
   * @returns {import("@luscious-garden/aster-core").CollectionDefinitionInput} Frozen authored collection input.
   */
  #scaledCollection(icons, name) {
    return Object.freeze({
      identity: Object.freeze({ namespace: "benchmark", name }),
      icons: Object.freeze(Object.fromEntries(icons.map((icon, index) => [
        `scale${index + 1}`,
        icon,
      ]))),
      metadata: Object.freeze({ displayName: `Benchmark ${name}` }),
    });
  }

  /**
   * @description Creates one mutable structured-path definition for isolated Core measurement.
   * @param {string} name - Stable benchmark identity suffix.
   * @param {import("@luscious-garden/aster-core").IconPathCommandType[]} commands - Mutable authored command sequence.
   * @returns {import("@luscious-garden/aster-core").IconDefinition} Mutable valid definition input.
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
   * @template Value
   * @param {Value} value - Canonical portable input.
   * @returns {Value} Structurally equivalent mutable clone.
   * @typeParam Value - Portable serialisable value family.
   */
  #clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
}
