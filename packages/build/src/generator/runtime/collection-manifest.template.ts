import type { TGenerationCandidate } from "../types/internal/generation-candidate.type.js";
import { GeneratedFileBannerFactory } from "./generated-file-banner.factory.js";
import { GeneratedModuleSpecifierFactory } from "./generated-module-specifier.factory.js";

/**
 * @description Renders the opt-in generated collection manifest.
 */
export class CollectionManifestTemplate {
  /**
   * @description Generated ownership banner authority.
   */
  readonly #bannerFactory = new GeneratedFileBannerFactory();

  /**
   * @description Generated relative ESM specifier authority.
   */
  readonly #specifierFactory = new GeneratedModuleSpecifierFactory();

  /**
   * @description Renders one complete LF-terminated opt-in manifest module.
   * @param candidates - Canonically ordered generated icon candidates.
   * @param sourceIds - Canonical sources responsible for the manifest.
   * @returns Byte-stable TypeScript module importing every definition explicitly.
   */
  render(
    candidates: readonly TGenerationCandidate[],
    sourceIds: readonly string[],
  ): string {
    const imports = candidates.map(
      (candidate) =>
        `import { ${candidate.name.symbol} as $${candidate.name.symbol} } from "${this.#specifierFactory.create(candidate.name.modulePath)}";`,
    );
    const entries = candidates.map(
      (candidate) =>
        `  ${JSON.stringify(candidate.name.manifestKey)}: $${candidate.name.symbol},`,
    );

    return [
      this.#bannerFactory.create(sourceIds).trimEnd(),
      "",
      ...imports,
      "",
      "/**",
      " * @description Immutable opt-in registry of every generated collection definition.",
      " */",
      "export const IconManifest = Object.freeze({",
      ...entries,
      "});",
      "",
    ].join("\n");
  }
}
