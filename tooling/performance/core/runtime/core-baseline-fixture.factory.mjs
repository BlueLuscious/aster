import { AsterCollection } from "@aster/icons";

/**
 * @description Prepares equivalent mutable and canonical Core benchmark inputs outside timed work.
 */
export class CoreBaselineFixtureFactory {
  /**
   * @description Creates one isolated scenario fixture matrix from the canonical pilot collection.
   * @returns {import("../contracts/internal/core-baseline-fixtures.contract.mjs").ICoreBaselineFixtures} Prepared public Core inputs.
   */
  create() {
    const canonicalIcons = AsterCollection.icons;
    const firstIcon = canonicalIcons[0];

    if (firstIcon === undefined) {
      throw new TypeError("The Core benchmark requires at least one canonical icon.");
    }

    return Object.freeze({
      canonicalIcons,
      mutableIcons: this.#clone(canonicalIcons),
      canonicalCollection: AsterCollection,
      mutableCollection: this.#clone(AsterCollection),
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
    });
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
