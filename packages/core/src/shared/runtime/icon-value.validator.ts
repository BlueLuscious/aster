import { IconDefinitionError } from "./icon-definition.error.js";

/**
 * @description Cohesive primitive assertions shared by Core normalisers.
 */
export class IconValueValidator {
  /**
   * @description Accepts one plain authored object.
   * @param value - Unknown value to inspect.
   * @param path - Logical path used by deterministic failures.
   * @returns The accepted object record.
   */
  record(value: unknown, path: string): Record<string, unknown> {
    const prototype =
      typeof value === "object" && value !== null
        ? Object.getPrototypeOf(value)
        : undefined;

    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      (prototype !== Object.prototype && prototype !== null)
    ) {
      throw new IconDefinitionError(path, "expected a plain object");
    }

    return value as Record<string, unknown>;
  }

  /**
   * @description Rejects unknown, symbolic, hidden, or accessor-owned object fields.
   * @param value - Object record whose keys are inspected.
   * @param accepted - Closed field sequence.
   * @param path - Logical object path.
   * @returns Nothing.
   */
  exactFields(
    value: Record<string, unknown>,
    accepted: readonly string[],
    path: string,
  ): void {
    for (const field of Reflect.ownKeys(value)) {
      if (typeof field !== "string") {
        throw new IconDefinitionError(path, "expected string fields");
      }

      const fieldPath = `${path}.${field}`;

      if (!accepted.includes(field)) {
        throw new IconDefinitionError(fieldPath, "unsupported field");
      }

      this.#enumerableDataProperty(value, field, fieldPath);
    }
  }

  /**
   * @description Accepts and trims one non-empty string.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Trimmed non-empty text.
   */
  text(value: unknown, path: string): string {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new IconDefinitionError(path, "expected non-empty text");
    }

    return value.trim();
  }

  /**
   * @description Accepts one finite number and canonicalises negative zero.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Finite canonical number.
   */
  finiteNumber(value: unknown, path: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new IconDefinitionError(path, "expected a finite number");
    }

    return Object.is(value, -0) ? 0 : value;
  }

  /**
   * @description Accepts one finite number greater than zero.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Positive finite number.
   */
  positiveNumber(value: unknown, path: string): number {
    const accepted = this.finiteNumber(value, path);

    if (accepted <= 0) {
      throw new IconDefinitionError(path, "expected a number greater than zero");
    }

    return accepted;
  }

  /**
   * @description Accepts one finite number greater than or equal to zero.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Non-negative finite number.
   */
  nonNegativeNumber(value: unknown, path: string): number {
    const accepted = this.finiteNumber(value, path);

    if (accepted < 0) {
      throw new IconDefinitionError(path, "expected a non-negative number");
    }

    return accepted;
  }

  /**
   * @description Accepts one opacity in the inclusive range from zero to one.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Canonical opacity.
   */
  opacity(value: unknown, path: string): number {
    const accepted = this.finiteNumber(value, path);

    if (accepted < 0 || accepted > 1) {
      throw new IconDefinitionError(path, "expected a number from zero to one");
    }

    return accepted;
  }

  /**
   * @description Accepts one boolean value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted boolean.
   */
  boolean(value: unknown, path: string): boolean {
    if (typeof value !== "boolean") {
      throw new IconDefinitionError(path, "expected a boolean");
    }

    return value;
  }

  /**
   * @description Accepts one dense array containing only enumerable data elements.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted mutable input array.
   */
  array(value: unknown, path: string): unknown[] {
    if (!Array.isArray(value)) {
      throw new IconDefinitionError(path, "expected an array");
    }

    let elementCount = 0;

    for (const field of Reflect.ownKeys(value)) {
      if (field === "length") {
        continue;
      }

      if (typeof field !== "string") {
        throw new IconDefinitionError(path, "expected indexed array fields");
      }

      const index = Number(field);

      if (
        !Number.isSafeInteger(index) ||
        index < 0 ||
        index >= value.length ||
        String(index) !== field
      ) {
        throw new IconDefinitionError(`${path}.${field}`, "unsupported field");
      }

      this.#enumerableDataProperty(value, field, `${path}[${index}]`);
      elementCount += 1;
    }

    if (elementCount !== value.length) {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new IconDefinitionError(
            `${path}[${index}]`,
            "expected an array element",
          );
        }
      }
    }

    return value;
  }

  /**
   * @description Requires one own property to use canonical enumerable data semantics.
   * @param value - Object that owns the inspected property.
   * @param field - Own string property key.
   * @param path - Logical property path.
   * @returns Nothing.
   */
  #enumerableDataProperty(
    value: object,
    field: string,
    path: string,
  ): void {
    const descriptor = Object.getOwnPropertyDescriptor(value, field);

    if (
      descriptor === undefined ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new IconDefinitionError(path, "expected an enumerable data field");
    }
  }
}
