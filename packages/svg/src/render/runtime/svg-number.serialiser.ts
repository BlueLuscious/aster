/**
 * @description Serialises canonical finite numbers for deterministic SVG output.
 */
export class SvgNumberSerialiser {
  /**
   * @description Serialises one finite number without locale dependence or negative zero.
   * @param value - Canonical finite numeric value.
   * @returns ECMAScript numeric string.
   */
  serialise(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
  }
}
