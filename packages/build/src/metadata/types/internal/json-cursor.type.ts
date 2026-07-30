/**
 * @description Mutable bounded cursor used while inspecting already valid JSON text.
 */
export type TJsonCursor = {
  /**
   * @description Exact JSON source text.
   */
  readonly content: string;

  /**
   * @description Current UTF-16 source offset.
   */
  offset: number;
};
