import { sourceModule } from "../constants/source-module.constant.mjs";

/**
 * @description Extracts statically recognisable module specifiers from source text.
 */
export class ModuleSpecifierExtractor {
  /**
   * @description Extracts imported and re-exported module specifiers in source order.
   * @param {string} source - TypeScript or JavaScript module source.
   * @returns {readonly string[]} Recognised module specifiers.
   */
  extract(source) {
    return Object.freeze(
      [...source.matchAll(sourceModule.specifierPattern)].map((match) => match[1]),
    );
  }
}
