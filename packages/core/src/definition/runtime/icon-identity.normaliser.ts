import type { IconIdentity } from "../contracts/index.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates and clones render-neutral icon identities.
 */
export class IconIdentityNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Canonical namespace, icon, and variant slug authority.
   */
  readonly #slugNormaliser = new CanonicalSlugNormaliser();

  /**
   * @description Produces one frozen canonical identity.
   * @param value - Unknown authored identity.
   * @param path - Logical object path.
   * @returns Frozen canonical identity.
   */
  normalise(value: unknown, path = "definition.identity"): IconIdentity {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["namespace", "name", "variant"], path);

    const namespace =
      "namespace" in record
        ? this.#validator.text(record.namespace, `${path}.namespace`)
        : undefined;
    const name = this.#validator.text(record.name, `${path}.name`);
    const variant =
      "variant" in record
        ? this.#validator.text(record.variant, `${path}.variant`)
        : undefined;

    if (namespace !== undefined) {
      this.#slugNormaliser.normalise(namespace, `${path}.namespace`);
    }

    this.#slugNormaliser.normalise(name, `${path}.name`);

    if (variant !== undefined) {
      this.#slugNormaliser.normalise(variant, `${path}.variant`);
    }

    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name,
      ...(variant === undefined ? {} : { variant }),
    });
  }
}
