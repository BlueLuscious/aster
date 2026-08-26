/**
 * @description Snapshots exact plain records and dense arrays without executing authored accessors.
 */
export class StructuredDataInspector {
  /**
   * @description Accepts one plain data record against closed field authorities.
   * @param value - Candidate record.
   * @param acceptedFields - Complete field names allowed on the record.
   * @param requiredFields - Field names that must be present.
   * @returns Frozen plain snapshot or no value after structural rejection.
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

    const snapshot: Record<string, unknown> = {};

    for (const key of keys) {
      if (typeof key !== "string") {
        return undefined;
      }

      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (
        descriptor === undefined
        || !descriptor.enumerable
        || !("value" in descriptor)
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
      || !("value" in lengthDescriptor)
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
        || !("value" in descriptor)
      ) {
        return undefined;
      }

      snapshot.push(descriptor.value);
    }

    return Object.freeze(snapshot);
  }
}

