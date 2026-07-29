import type { SourceIdentity } from "../contracts/index.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";

/**
 * @description Validates and clones canonical source identity claims.
 */
export class SourceIdentityNormaliser {
  /**
   * @description Primitive build-value validator.
   */
  readonly #validator = new BuildValueValidator();

  /**
   * @description Canonical collection, icon, and variant slug grammar.
   */
  readonly #slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Produces one frozen complete icon identity.
   * @param value - Unknown identity claim.
   * @param path - Logical identity path.
   * @returns Frozen canonical identity.
   */
  normalise(value: unknown, path: string): SourceIdentity {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["collection", "name", "variant"], path);
    const collection = this.normaliseCollection(
      record.collection,
      `${path}.collection`,
    );
    const name = this.#normaliseSlug(record.name, `${path}.name`);
    const variant =
      "variant" in record
        ? this.#normaliseSlug(record.variant, `${path}.variant`)
        : undefined;

    return Object.freeze({
      collection,
      name,
      ...(variant === undefined ? {} : { variant }),
    });
  }

  /**
   * @description Produces one canonical collection slug.
   * @param value - Unknown collection slug.
   * @param path - Logical slug path.
   * @returns Accepted collection slug.
   */
  normaliseCollection(value: unknown, path: string): string {
    return this.#normaliseSlug(value, path);
  }

  /**
   * @description Accepts one exact ASCII lowercase kebab-case slug.
   * @param value - Unknown slug candidate.
   * @param path - Logical slug path.
   * @returns Accepted canonical slug.
   */
  #normaliseSlug(value: unknown, path: string): string {
    if (typeof value !== "string" || !this.#slugPattern.test(value)) {
      throw new BuildContractError(
        path,
        "expected an ASCII lowercase kebab-case slug",
      );
    }

    return value;
  }
}
