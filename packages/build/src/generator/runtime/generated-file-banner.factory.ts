import { generatedFileMarker } from "../constants/generated-file-marker.constant.js";

/**
 * @description Creates stable ownership and rebuild instructions for generated text modules.
 */
export class GeneratedFileBannerFactory {
  /**
   * @description Creates one LF-terminated generated-module banner.
   * @param sourceIds - Canonical source identifiers responsible for the module.
   * @returns Stable line-comment banner with JSON-escaped source identifiers.
   */
  create(sourceIds: readonly string[]): string {
    const canonical = [...sourceIds].sort((left, right) =>
      this.#compareText(left, right),
    );

    return [
      generatedFileMarker,
      `// Sources: ${this.#serialise(canonical)}`,
      "// Rebuild: pnpm aster:build",
      "// Do not edit manually.",
      "",
    ].join("\n");
  }

  /**
   * @description Serialises canonical source identifiers onto one safe line-comment line.
   * @param sourceIds - Canonically ordered source identifiers.
   * @returns Compact JSON with JavaScript line separators escaped.
   */
  #serialise(sourceIds: readonly string[]): string {
    return JSON.stringify(sourceIds)
      .replaceAll("\u2028", String.raw`\u2028`)
      .replaceAll("\u2029", String.raw`\u2029`);
  }

  /**
   * @description Compares text by Unicode code-unit order.
   * @param left - First text value.
   * @param right - Second text value.
   * @returns Negative, zero, or positive ordering value.
   */
  #compareText(left: string, right: string): number {
    return left < right ? -1 : left > right ? 1 : 0;
  }
}
