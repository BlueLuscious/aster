import type { IconIdentity } from "@aster/core";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { CanonicalSlugNormaliser } from "../../shared/runtime/canonical-slug.normaliser.js";

/**
 * @description Validates and clones canonical source identity claims.
 */
export class SourceIdentityNormaliser {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Canonical namespace, icon, and variant slug authority.
   */
  readonly #slugNormaliser = new CanonicalSlugNormaliser();

  /**
   * @description Produces one frozen complete icon identity.
   * @param value - Unknown identity claim.
   * @param path - Logical identity path.
   * @returns Frozen canonical identity.
   */
  normalise(value: unknown, path: string): IconIdentity {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["namespace", "name", "variant"],
      path,
      ["name"],
    );
    const namespace =
      "namespace" in record
        ? this.#slugNormaliser.normalise(
            record.namespace,
            `${path}.namespace`,
          )
        : undefined;
    const name = this.#slugNormaliser.normalise(record.name, `${path}.name`);
    const variant =
      "variant" in record
        ? this.#slugNormaliser.normalise(record.variant, `${path}.variant`)
        : undefined;

    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name,
      ...(variant === undefined ? {} : { variant }),
    });
  }
}
