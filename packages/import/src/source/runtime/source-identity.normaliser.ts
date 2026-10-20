import type { IconIdentity } from "@luscious-garden/aster-core";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { CanonicalSlugValidator } from "../../shared/runtime/canonical-slug.validator.js";

/**
 * @description Validates and clones canonical source identity claims from own data fields.
 */
export class SourceIdentityNormaliser {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Canonical namespace, icon, and variant slug authority.
   */
  readonly #slugValidator = new CanonicalSlugValidator();

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
      ["name", "variant"],
    );
    const namespace =
      Object.hasOwn(record, "namespace")
        ? this.#slugValidator.validate(
            record.namespace,
            `${path}.namespace`,
          )
        : undefined;
    const name = this.#slugValidator.validate(record.name, `${path}.name`);
    const variant = this.#slugValidator.validate(record.variant, `${path}.variant`);

    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name,
      variant,
    });
  }
}
