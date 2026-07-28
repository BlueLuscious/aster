import type { IconIdentity } from "../../definition/contracts/index.js";
import type { IconMetadata } from "../contracts/index.js";
import type { IconRtlPolicyType } from "../types/index.js";
import { IconIdentityNormaliser } from "../../definition/runtime/icon-identity.normaliser.js";
import { CollectionPresentationPolicyNormaliser } from "../../presentation/runtime/collection-presentation-policy.normaliser.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates, clones, and freezes resolved portable icon metadata.
 */
export class IconMetadataNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Replacement identity normaliser.
   */
  readonly #identityNormaliser = new IconIdentityNormaliser();

  /**
   * @description Resolved collection policy normaliser.
   */
  readonly #presentationPolicyNormaliser =
    new CollectionPresentationPolicyNormaliser();

  /**
   * @description Produces one deeply frozen canonical metadata value.
   * @param value - Unknown authored metadata.
   * @param identity - Canonical identity of the owning definition.
   * @returns Deeply frozen canonical metadata.
   */
  normalise(value: unknown, identity: IconIdentity): IconMetadata {
    const path = "definition.metadata";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      [
        "displayName",
        "rtl",
        "presentation",
        "licence",
        "attribution",
        "deprecated",
        "replacedBy",
      ],
      path,
    );

    const displayName = this.#validator.text(record.displayName, `${path}.displayName`);
    const rtl = this.#normaliseRtl(record.rtl, `${path}.rtl`);
    const presentation = this.#presentationPolicyNormaliser.normalise(
      record.presentation,
    );
    const licence =
      "licence" in record
        ? this.#validator.text(record.licence, `${path}.licence`)
        : undefined;
    const attribution =
      "attribution" in record
        ? this.#validator.text(record.attribution, `${path}.attribution`)
        : undefined;
    const deprecated = this.#validator.boolean(record.deprecated, `${path}.deprecated`);
    const replacedBy =
      "replacedBy" in record
        ? this.#identityNormaliser.normalise(record.replacedBy, `${path}.replacedBy`)
        : undefined;

    if (attribution !== undefined && licence === undefined) {
      throw new IconDefinitionError(
        `${path}.attribution`,
        "requires an effective licence",
      );
    }

    if (replacedBy !== undefined && !deprecated) {
      throw new IconDefinitionError(
        `${path}.replacedBy`,
        "requires deprecated metadata",
      );
    }

    if (replacedBy !== undefined && this.#identitiesMatch(identity, replacedBy)) {
      throw new IconDefinitionError(`${path}.replacedBy`, "cannot replace itself");
    }

    return Object.freeze({
      displayName,
      rtl,
      presentation,
      ...(licence === undefined ? {} : { licence }),
      ...(attribution === undefined ? {} : { attribution }),
      deprecated,
      ...(replacedBy === undefined ? {} : { replacedBy }),
    });
  }

  /**
   * @description Accepts one closed right-to-left policy.
   * @param value - Unknown authored policy.
   * @param path - Logical value path.
   * @returns Accepted policy.
   */
  #normaliseRtl(value: unknown, path: string): IconRtlPolicyType {
    if (value !== "mirror" && value !== "preserve" && value !== "manual") {
      throw new IconDefinitionError(path, "expected one of mirror, preserve, manual");
    }

    return value;
  }

  /**
   * @description Compares complete logical icon identities.
   * @param left - First canonical identity.
   * @param right - Second canonical identity.
   * @returns Whether collection, name, and optional variant match.
   */
  #identitiesMatch(left: IconIdentity, right: IconIdentity): boolean {
    return (
      left.collection === right.collection &&
      left.name === right.name &&
      left.variant === right.variant
    );
  }
}
