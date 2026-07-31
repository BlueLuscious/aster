import type { CollectionIdentity } from "../contracts/index.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";

/**
 * @description Validates and clones collection identities independently of membership.
 */
export class CollectionIdentityNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Canonical namespace and collection slug authority.
   */
  readonly #slugNormaliser = new CanonicalSlugNormaliser();

  /**
   * @description Produces one frozen canonical collection identity.
   * @param value - Unknown authored collection identity.
   * @param path - Logical object path.
   * @returns Frozen canonical collection identity.
   */
  normalise(
    value: unknown,
    path = "collection.identity",
  ): CollectionIdentity {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["namespace", "name"], path);
    const namespace =
      "namespace" in record
        ? this.#validator.text(record.namespace, `${path}.namespace`)
        : undefined;
    const name = this.#validator.text(record.name, `${path}.name`);

    if (namespace !== undefined) {
      this.#slugNormaliser.normalise(namespace, `${path}.namespace`);
    }

    this.#slugNormaliser.normalise(name, `${path}.name`);

    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name,
    });
  }
}
