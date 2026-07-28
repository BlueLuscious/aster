import type { CollectionPresentationPolicy } from "../contracts/index.js";
import type { IconPresentationOverrideType } from "../types/index.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { IconPresentationNormaliser } from "./icon-presentation.normaliser.js";

/**
 * @description Validates and canonicalises resolved collection presentation policy.
 */
export class CollectionPresentationPolicyNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Presentation object normaliser.
   */
  readonly #presentationNormaliser = new IconPresentationNormaliser();

  /**
   * @description Canonical semantic order for caller presentation capabilities.
   */
  readonly #overrideOrder = Object.freeze(["fill", "stroke", "strokeWidth"] as const);

  /**
   * @description Produces one deeply frozen policy.
   * @param value - Unknown authored policy.
   * @returns Deeply frozen canonical policy.
   */
  normalise(value: unknown): CollectionPresentationPolicy {
    const path = "definition.metadata.presentation";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["defaults", "overrides", "defaultSize", "minimumSize"],
      path,
    );

    const defaults = this.#presentationNormaliser.normalise(
      record.defaults,
      `${path}.defaults`,
    );
    const overridesInput = this.#validator.array(record.overrides, `${path}.overrides`);
    const overrides = overridesInput.map((entry, index) => {
      if (
        typeof entry !== "string" ||
        !this.#overrideOrder.includes(entry as IconPresentationOverrideType)
      ) {
        throw new IconDefinitionError(
          `${path}.overrides[${index}]`,
          `expected one of ${this.#overrideOrder.join(", ")}`,
        );
      }

      return entry as IconPresentationOverrideType;
    });

    if (new Set(overrides).size !== overrides.length) {
      throw new IconDefinitionError(`${path}.overrides`, "expected unique capabilities");
    }

    const canonicalOverrides = Object.freeze(
      this.#overrideOrder.filter((capability) => overrides.includes(capability)),
    );
    const defaultSize =
      "defaultSize" in record
        ? this.#validator.positiveNumber(record.defaultSize, `${path}.defaultSize`)
        : undefined;
    const minimumSize =
      "minimumSize" in record
        ? this.#validator.positiveNumber(record.minimumSize, `${path}.minimumSize`)
        : undefined;

    if (
      defaultSize !== undefined &&
      minimumSize !== undefined &&
      minimumSize > defaultSize
    ) {
      throw new IconDefinitionError(
        `${path}.minimumSize`,
        "cannot exceed the default size",
      );
    }

    return Object.freeze({
      defaults,
      overrides: canonicalOverrides,
      ...(defaultSize === undefined ? {} : { defaultSize }),
      ...(minimumSize === undefined ? {} : { minimumSize }),
    });
  }
}
