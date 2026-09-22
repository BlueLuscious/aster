import type { IconDefinition } from "../../definition/contracts/index.js";

/**
 * @description Determines whether authored frozen data exactly matches a canonical icon graph.
 * @remarks The authored value must first pass complete `IconDefinitionFactory` reconstruction;
 * this matcher proves retention equivalence and never replaces semantic validation.
 */
export class CanonicalIconMatcher {
  /**
   * @description Compares one authored value with an independently reconstructed definition.
   * @param authored - Original caller-owned value.
   * @param canonical - Canonical isolated reconstruction.
   * @returns Whether the authored graph can be retained without changing canonical semantics.
   */
  matches(
    authored: unknown,
    canonical: IconDefinition,
  ): authored is IconDefinition {
    return this.#matchesValue(
      authored,
      canonical,
      new WeakMap<object, object>(),
    );
  }

  /**
   * @description Compares primitive identity, graph topology, key order, and frozen data values.
   * @param authored - Authored value at the current graph position.
   * @param canonical - Canonical value at the corresponding graph position.
   * @param correspondences - Previously accepted authored-to-canonical object pairs.
   * @returns Whether both values are canonically equivalent at this position.
   */
  #matchesValue(
    authored: unknown,
    canonical: unknown,
    correspondences: WeakMap<object, object>,
  ): boolean {
    if (
      typeof authored !== "object" ||
      authored === null ||
      typeof canonical !== "object" ||
      canonical === null
    ) {
      return Object.is(authored, canonical);
    }

    const previous = correspondences.get(authored);

    if (previous !== undefined) {
      return previous === canonical;
    }

    if (
      !Object.isFrozen(authored) ||
      Object.getPrototypeOf(authored) !== Object.getPrototypeOf(canonical)
    ) {
      return false;
    }

    correspondences.set(authored, canonical);
    const authoredFields = Object.keys(authored);
    const canonicalFields = Object.keys(canonical);

    if (authoredFields.length !== canonicalFields.length) {
      return false;
    }

    for (let index = 0; index < authoredFields.length; index += 1) {
      const authoredField = authoredFields[index];
      const canonicalField = canonicalFields[index];

      if (
        authoredField === undefined ||
        canonicalField === undefined ||
        authoredField !== canonicalField
      ) {
        return false;
      }

      if (
        !this.#matchesValue(
          (authored as Record<string, unknown>)[authoredField],
          (canonical as Record<string, unknown>)[canonicalField],
          correspondences,
        )
      ) {
        return false;
      }
    }

    return true;
  }
}
