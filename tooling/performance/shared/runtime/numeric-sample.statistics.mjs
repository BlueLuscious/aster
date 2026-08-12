/**
 * @description Calculates stable summary statistics without mutating numeric observations.
 */
export class NumericSampleStatistics {
  /**
   * @description Summarises one non-empty numeric sample.
   * @param {readonly number[]} values - Numeric observations to order without mutation.
   * @returns {{ median: number, minimum: number, maximum: number }} Sample summary.
   */
  summarise(values) {
    if (values.length === 0) {
      throw new TypeError("Numeric samples cannot be empty.");
    }

    const ordered = [...values].sort((left, right) => left - right);
    const middle = Math.floor(ordered.length / 2);
    const median =
      ordered.length % 2 === 1
        ? ordered[middle]
        : (ordered[middle - 1] + ordered[middle]) / 2;

    return Object.freeze({
      median,
      minimum: ordered[0],
      maximum: ordered[ordered.length - 1],
    });
  }
}
