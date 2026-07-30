import type { TGenerationCandidate } from "../types/internal/generation-candidate.type.js";
import { GeneratedFileBannerFactory } from "./generated-file-banner.factory.js";
import { GeneratedModuleSpecifierFactory } from "./generated-module-specifier.factory.js";

/**
 * @description Renders the generated collection root convenience exports.
 */
export class CollectionIndexTemplate {
  /**
   * @description Generated ownership banner authority.
   */
  readonly #bannerFactory = new GeneratedFileBannerFactory();

  /**
   * @description Generated relative ESM specifier authority.
   */
  readonly #specifierFactory = new GeneratedModuleSpecifierFactory();

  /**
   * @description Renders one complete LF-terminated collection root module.
   * @param candidates - Canonically ordered generated icon candidates.
   * @param sourceIds - Canonical sources responsible for the aggregate module.
   * @returns Byte-stable TypeScript export barrel.
   */
  render(
    candidates: readonly TGenerationCandidate[],
    sourceIds: readonly string[],
  ): string {
    return [
      this.#bannerFactory.create(sourceIds).trimEnd(),
      "",
      ...candidates.map(
        (candidate) =>
          `export { ${candidate.name.symbol} } from "${this.#specifierFactory.create(candidate.name.modulePath)}";`,
      ),
      "",
    ].join("\n");
  }
}
