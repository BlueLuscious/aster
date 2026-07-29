/**
 * @description Exact decoded textual source accepted at the pure build-domain boundary.
 * @remarks Content is strict UTF-8 text without a byte-order mark. Newline sequences remain
 * unchanged so offsets continue to identify the canonical input.
 */
export interface CanonicalTextSource {
  /**
   * @description Canonical repository-relative logical identifier using `/` separators.
   */
  readonly sourceId: string;

  /**
   * @description Exact decoded source content without newline normalisation.
   */
  readonly content: string;
}
