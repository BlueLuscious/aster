/**
 * @description Snapshots own enumerable release evidence without evaluating accessors or inheriting absent fields.
 * @remarks The private shallow snapshot has no prototype. Each release owner still validates its required fields and nested values.
 * @param {unknown} value - Candidate JSON object or injected data record.
 * @param {string} label - Domain-owned diagnostic label.
 * @returns {Record<string, unknown>} Frozen own-data snapshot.
 */
export function releaseRecordSnapshot(value, label) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected ${label} to be an object.`);
  }
  /** @type {Record<string, unknown>} */
  const snapshot = Object.create(null);
  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!descriptor.enumerable) {
      continue;
    }
    if (!Object.hasOwn(descriptor, "value")) {
      throw new Error(`Expected ${label} to contain only data properties.`);
    }
    snapshot[name] = descriptor.value;
  }
  return Object.freeze(snapshot);
}
