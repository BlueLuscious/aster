import { IconImportError } from "../../error/index.js";

/**
 * @description Primitive assertions shared by host-independent Import services.
 */
export class ImportValueValidator {
  /**
   * @description Accepts one plain object value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted object record.
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
      throw new IconImportError(path, "expected a plain object");
    }

    return value as Record<string, unknown>;
  }

  /**
   * @description Rejects own enumerable fields outside a closed sequence.
   * @param value - Object record whose fields are inspected.
   * @param accepted - Closed accepted field sequence.
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
        throw new IconImportError(path, "expected string-named fields");
      }

      if (!accepted.includes(field)) {
        throw new IconImportError(`${path}.${field}`, "unsupported field");
      }

      this.#enumerableDataProperty(value, field, `${path}.${field}`);
    }
  }

  /**
   * @description Accepts one non-empty string without changing its contents.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted non-empty string.
   */
  nonEmptyString(value: unknown, path: string): string {
    if (typeof value !== "string" || value.length === 0) {
      throw new IconImportError(path, "expected a non-empty string");
    }

    return value;
  }

  /**
   * @description Accepts one array value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted mutable input array.
   */
  array(value: unknown, path: string): unknown[] {
    if (
      !Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Array.prototype
    ) {
      throw new IconImportError(path, "expected an ordinary array");
    }

    let elementCount = 0;

    for (const field of Reflect.ownKeys(value)) {
      if (field === "length") {
        continue;
      }

      if (typeof field !== "string") {
        throw new IconImportError(path, "expected indexed array fields");
      }

      const index = Number(field);

      if (
        !Number.isSafeInteger(index) ||
        index < 0 ||
        index >= value.length ||
        String(index) !== field
      ) {
        throw new IconImportError(`${path}.${field}`, "unsupported field");
      }

      this.#enumerableDataProperty(value, field, `${path}[${index}]`);
      elementCount += 1;
    }

    if (elementCount !== value.length) {
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) {
          throw new IconImportError(
            `${path}[${index}]`,
            "expected an array element",
          );
        }
      }
    }

    return value;
  }

  /**
   * @description Accepts one integer at or above a specified minimum.
   * @param value - Unknown value to inspect.
   * @param minimum - Inclusive minimum accepted value.
   * @param path - Logical value path.
   * @returns Accepted integer.
   */
  integer(value: unknown, minimum: number, path: string): number {
    if (
      typeof value !== "number" ||
      !Number.isSafeInteger(value) ||
      value < minimum
    ) {
      throw new IconImportError(
        path,
        `expected a safe integer greater than or equal to ${minimum}`,
      );
    }

    return value;
  }

  /**
   * @description Accepts one finite numeric value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted finite number with negative zero canonicalised.
   */
  finiteNumber(value: unknown, path: string): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new IconImportError(path, "expected a finite number");
    }

    return Object.is(value, -0) ? 0 : value;
  }

  /**
   * @description Accepts one positive finite numeric value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted positive finite number.
   */
  positiveNumber(value: unknown, path: string): number {
    const accepted = this.finiteNumber(value, path);

    if (accepted <= 0) {
      throw new IconImportError(path, "expected a positive finite number");
    }

    return accepted;
  }

  /**
   * @description Accepts one non-negative finite numeric value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted non-negative finite number.
   */
  nonNegativeNumber(value: unknown, path: string): number {
    const accepted = this.finiteNumber(value, path);

    if (accepted < 0) {
      throw new IconImportError(path, "expected a non-negative finite number");
    }

    return accepted;
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
      throw new IconImportError(path, "expected an enumerable data field");
    }
  }
}
