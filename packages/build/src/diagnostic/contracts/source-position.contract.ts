/**
 * @description Exact source offset with a deterministic human-readable display position.
 */
export interface SourcePosition {
  /**
   * @description Zero-based UTF-16 code-unit offset.
   */
  readonly offset: number;

  /**
   * @description One-based logical line.
   */
  readonly line: number;

  /**
   * @description One-based UTF-16 code-unit column.
   */
  readonly column: number;
}
