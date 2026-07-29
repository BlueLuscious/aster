/**
 * @description Technical result of inspecting one authored SVG path-data value.
 */
export type TSvgPathInspection = {
  /**
   * @description Whether the complete path value follows the accepted SVG path grammar.
   */
  readonly valid: boolean;

  /**
   * @description Number of explicitly authored supported commands.
   */
  readonly commandCount: number;

  /**
   * @description Whether the path contains an operation capable of producing geometry.
   */
  readonly hasDrawingOperation: boolean;

  /**
   * @description Finite coordinate and size values suitable for provisional grid inspection.
   */
  readonly gridValues: readonly number[];
};
