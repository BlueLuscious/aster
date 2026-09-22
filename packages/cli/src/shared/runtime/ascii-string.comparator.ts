/**
 * @description Compares canonical ASCII strings without locale-sensitive behaviour.
 */
export class AsciiStringComparator {
  /**
   * @description Compares two canonical ASCII values lexically.
   * @param left - Left canonical value.
   * @param right - Right canonical value.
   * @returns Negative, zero, or positive lexical relation.
   */
  compare(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}

