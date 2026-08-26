import { CanonicalIdentityValidator } from "../../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";

/**
 * @description Accepts shared optional provider, collection, and tag invocation filters.
 */
export class InvocationFilterNormaliser {
  /**
   * @description Canonical provider, collection, and tag identity validator.
   */
  readonly #identities = new CanonicalIdentityValidator();

  /**
   * @description Dense-array acceptance authority for repeated tags.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Validates one optional canonical provider identity field.
   * @param record - Accepted invocation record.
   * @param field - Optional provider field identity.
   * @returns Whether the absent or present field is accepted.
   */
  provider(
    record: Readonly<Record<string, unknown>>,
    field: string,
  ): boolean {
    return !Object.hasOwn(record, field) || this.#identities.slug(record[field]);
  }

  /**
   * @description Validates one optional canonical collection identity field.
   * @param record - Accepted invocation record.
   * @param field - Optional collection field identity.
   * @returns Whether the absent or present field is accepted.
   */
  collection(
    record: Readonly<Record<string, unknown>>,
    field: string,
  ): boolean {
    return !Object.hasOwn(record, field)
      || this.#identities.collection(record[field]);
  }

  /**
   * @description Accepts optional unique canonical tags.
   * @param record - Accepted invocation record.
   * @returns Frozen tags, no value when absent, or null after rejection.
   */
  tags(
    record: Readonly<Record<string, unknown>>,
  ): readonly string[] | undefined | null {
    if (!Object.hasOwn(record, "tags")) {
      return undefined;
    }

    const values = this.#data.array(record.tags);

    if (
      values === undefined
      || values.length === 0
      || !values.every((tag) => this.#identities.slug(tag))
      || new Set(values).size !== values.length
    ) {
      return null;
    }

    return Object.freeze(values as string[]);
  }
}
