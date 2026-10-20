/**
 * @description Snapshots exact plain records and dense arrays without executing authored accessors.
 */
export class StructuredDataInspector {
  /**
   * @description Reads one own enumerable data member from an ordinary record without executing it.
   * @param value - Candidate plain record.
   * @param key - Own field to inspect.
   * @returns Frozen member snapshot or no value after structural rejection.
   */
  ownDataMember(
    value: unknown,
    key: string,
  ): Readonly<{
    /** @description Safely snapshotted own data-member value. */
    value: unknown;
  }> | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }

    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      return undefined;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    return descriptor !== undefined
      && descriptor.enumerable
      && Object.hasOwn(descriptor, "value")
      ? Object.freeze({ value: descriptor.value })
      : undefined;
  }

  /**
   * @description Accepts one plain data record against closed field authorities.
   * @remarks The empty snapshot loses its prototype before any captured field is assigned.
   * @param value - Candidate record.
   * @param acceptedFields - Complete field names allowed on the record.
   * @param requiredFields - Field names that must be present.
   * @returns Frozen null-prototype snapshot or no value after structural rejection.
   */
  record(
    value: unknown,
    acceptedFields: readonly string[],
    requiredFields: readonly string[] = [],
  ): Readonly<Record<string, unknown>> | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }

    const prototype = Object.getPrototypeOf(value);

    if (prototype !== Object.prototype && prototype !== null) {
      return undefined;
    }

    const keys = Reflect.ownKeys(value);

    if (
      keys.some((key) => typeof key !== "string" || !acceptedFields.includes(key))
      || requiredFields.some((field) => !keys.includes(field))
    ) {
      return undefined;
    }

    const snapshot: Record<string, unknown> = Object.setPrototypeOf({}, null);

    for (const key of keys) {
      if (typeof key !== "string") {
        return undefined;
      }

      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (
        descriptor === undefined
        || !descriptor.enumerable
        || !Object.hasOwn(descriptor, "value")
      ) {
        return undefined;
      }

      snapshot[key] = descriptor.value;
    }

    return Object.freeze(snapshot);
  }

  /**
   * @description Accepts one ordinary dense data array without authored side fields.
   * @param value - Candidate array.
   * @returns Frozen shallow value snapshot or no value after structural rejection.
   */
  array(value: unknown): readonly unknown[] | undefined {
    if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
      return undefined;
    }

    const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");

    if (
      lengthDescriptor === undefined
      || !Object.hasOwn(lengthDescriptor, "value")
      || typeof lengthDescriptor.value !== "number"
    ) {
      return undefined;
    }

    const length = lengthDescriptor.value;
    const keys = Reflect.ownKeys(value);

    if (keys.length !== length + 1 || !keys.includes("length")) {
      return undefined;
    }

    const snapshot: unknown[] = [];

    for (let index = 0; index < length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));

      if (
        descriptor === undefined
        || !descriptor.enumerable
        || !Object.hasOwn(descriptor, "value")
      ) {
        return undefined;
      }

      snapshot.push(descriptor.value);
    }

    return Object.freeze(snapshot);
  }
}
