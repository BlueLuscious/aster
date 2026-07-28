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
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype &&
        Object.getPrototypeOf(value) !== null)
    ) {
      throw new IconDefinitionError(path, "expected a plain object");
    }

    return value as Record<string, unknown>;
  }

  /**
   * @description Rejects unknown own enumerable fields.
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
    const unknown = Object.keys(value).find((field) => !accepted.includes(field));

    if (unknown !== undefined) {
      throw new IconDefinitionError(`${path}.${unknown}`, "unsupported field");
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
   * @description Accepts one array value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted mutable input array.
   */
  array(value: unknown, path: string): unknown[] {
    if (!Array.isArray(value)) {
      throw new IconDefinitionError(path, "expected an array");
    }

    return value;
  }
}
