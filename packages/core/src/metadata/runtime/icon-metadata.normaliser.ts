import type { IconIdentity } from "../../definition/contracts/index.js";
import type { IconMetadata } from "../contracts/index.js";
import type { IconRtlPolicyType } from "../types/index.js";
import { IconIdentityNormaliser } from "../../definition/runtime/icon-identity.normaliser.js";
import { IconPresentationPolicyNormaliser } from "../../presentation/runtime/icon-presentation-policy.normaliser.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { iconRtlPolicies } from "../constants/icon-rtl-policies.constant.js";

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
   * @description Canonical intrinsic tag authority.
   */
  readonly #slugNormaliser = new CanonicalSlugNormaliser();

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
    );

    const displayName = this.#validator.text(record.displayName, `${path}.displayName`);
    const tags =
      "tags" in record
        ? this.#normaliseTags(record.tags, `${path}.tags`)
        : undefined;
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
  #normaliseRtl(value: unknown, path: string): IconRtlPolicyType {
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
   * @description Compares complete logical icon identities.
   * @param left - First canonical identity.
   * @param right - Second canonical identity.
   * @returns Whether namespace, name, and optional variant match.
   */
  #identitiesMatch(left: IconIdentity, right: IconIdentity): boolean {
    return (
      left.namespace === right.namespace &&
      left.name === right.name &&
      left.variant === right.variant
    );
  }

  /**
   * @description Validates, deduplicates, and freezes intrinsic icon tags.
   * @param value - Unknown authored tag collection.
   * @param path - Logical tag collection path.
   * @returns Frozen tags preserving authored order.
   */
  #normaliseTags(value: unknown, path: string): readonly string[] {
    const tags = this.#validator.array(value, path).map((tag, index) => {
      const tagPath = `${path}[${index}]`;
      return this.#slugNormaliser.normalise(
        this.#validator.text(tag, tagPath),
        tagPath,
      );
    });

    if (new Set(tags).size !== tags.length) {
      throw new IconDefinitionError(path, "expected unique tags");
    }

    return Object.freeze(tags);
  }
}
