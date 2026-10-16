import type { IconIdentity } from "../contracts/index.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Normalises render-neutral icon identities and derives their variant property names.
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
    this.#validator.exactFields(record, ["namespace", "name", "variant"], path, ["name", "variant"]);

    const namespace =
      Object.hasOwn(record, "namespace")
        ? this.#validator.text(record.namespace, `${path}.namespace`)
        : undefined;
    const name = this.#validator.text(record.name, `${path}.name`);
    const variant = this.#validator.text(record.variant, `${path}.variant`);

    if (namespace !== undefined) {
      this.#slugNormaliser.normalise(namespace, `${path}.namespace`);
    }

    this.#slugNormaliser.normalise(name, `${path}.name`);

    this.#slugNormaliser.normalise(variant, `${path}.variant`);

    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name,
      variant,
    });
  }

  /**
   * @description Validates a treatment slug and derives its dictionary property name without changing the identity.
   * @param value - Candidate explicit treatment slug.
   * @param path - Logical path used for deterministic validation failures.
   * @returns Canonical property name, retaining valid digit-led segments.
   */
  variantPropertyName(value: unknown, path = "variant"): string {
    const slug = this.#slugNormaliser.normalise(this.#validator.text(value, path), path);
    return slug.split("-").map((part, index) =>
      index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`
    ).join("");
  }
}
