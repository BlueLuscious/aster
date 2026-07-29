import { BuildContractError } from "./build-contract.error.js";

/**
 * @description Primitive assertions shared by pure build-time domain services.
 */
export class BuildValueValidator {
  /**
   * @description Accepts one plain object value.
   * @param value - Unknown value to inspect.
   * @param path - Logical value path.
   * @returns Accepted object record.
   */
  record(value: unknown, path: string): Record<string, unknown> {
    if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype &&
        Object.getPrototypeOf(value) !== null)
    ) {
      throw new BuildContractError(path, "expected a plain object");
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
    const unsupported = Object.keys(value).find(
      (field) => !accepted.includes(field),
    );

    if (unsupported !== undefined) {
      throw new BuildContractError(`${path}.${unsupported}`, "unsupported field");
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
      throw new BuildContractError(path, "expected a non-empty string");
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
      throw new BuildContractError(path, "expected an array");
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
      throw new BuildContractError(
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
      throw new BuildContractError(path, "expected a finite number");
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
      throw new BuildContractError(path, "expected a positive finite number");
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
      throw new BuildContractError(path, "expected a non-negative finite number");
    }

    return accepted;
  }
}
