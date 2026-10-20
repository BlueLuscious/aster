import type { IconIdentity } from "../../definition/contracts/index.js";
import type { IconMetadata } from "../contracts/index.js";
import type { IconRtlPolicyType } from "../types/index.js";
import { IconIdentityNormaliser } from "../../definition/runtime/icon-identity.normaliser.js";
import { IconPresentationPolicyNormaliser } from "../../presentation/runtime/icon-presentation-policy.normaliser.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { iconRtlPolicies } from "../constants/icon-rtl-policies.constant.js";
import { MetadataTagSequenceNormaliser } from "./metadata-tag-sequence.normaliser.js";

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
   * @description Intrinsic metadata-tag sequence authority shared with collections.
   */
  readonly #tagNormaliser = new MetadataTagSequenceNormaliser();

  /**
   * @description Resolved icon presentation policy normaliser.
   */
  readonly #presentationPolicyNormaliser =
    new IconPresentationPolicyNormaliser();

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
        "tags",
        "rtl",
        "presentation",
        "licence",
        "attribution",
        "deprecated",
        "replacedBy",
      ],
      path,
      ["displayName", "rtl", "presentation", "deprecated"],
    );

    const displayName = this.#validator.text(record.displayName, `${path}.displayName`);
    const tags =
      Object.hasOwn(record, "tags")
        ? this.#tagNormaliser.normalise(record.tags, `${path}.tags`)
        : undefined;
    const rtl = this.#validateRtl(record.rtl, `${path}.rtl`);
    const presentation = this.#presentationPolicyNormaliser.normalise(
      record.presentation,
    );
    const licence =
      Object.hasOwn(record, "licence")
        ? this.#validator.text(record.licence, `${path}.licence`)
        : undefined;
    const attribution =
      Object.hasOwn(record, "attribution")
        ? this.#validator.text(record.attribution, `${path}.attribution`)
        : undefined;
    const deprecated = this.#validator.boolean(record.deprecated, `${path}.deprecated`);
    const replacedBy =
      Object.hasOwn(record, "replacedBy")
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
      ...(tags === undefined ? {} : { tags }),
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
  #validateRtl(value: unknown, path: string): IconRtlPolicyType {
    if (
      typeof value !== "string" ||
      !iconRtlPolicies.includes(value as IconRtlPolicyType)
    ) {
      throw new IconDefinitionError(
        path,
        `expected one of ${iconRtlPolicies.join(", ")}`,
      );
    }

    return value as IconRtlPolicyType;
  }

  /**
   * @description Compares complete logical icon identities using only their own namespace fields.
   * @param left - First canonical identity.
   * @param right - Second canonical identity.
   * @returns Whether namespace, name and required treatment match.
   */
  #identitiesMatch(left: IconIdentity, right: IconIdentity): boolean {
    const leftNamespace = Object.hasOwn(left, "namespace") ? left.namespace : undefined;
    const rightNamespace = Object.hasOwn(right, "namespace") ? right.namespace : undefined;

    return (
      leftNamespace === rightNamespace &&
      left.name === right.name &&
      left.variant === right.variant
    );
  }
}
