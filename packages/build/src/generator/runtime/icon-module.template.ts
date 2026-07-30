import type { TGenerationCandidate } from "../types/internal/generation-candidate.type.js";
import { GeneratedFileBannerFactory } from "./generated-file-banner.factory.js";
import { IconDefinitionTemplate } from "./icon-definition.template.js";

/**
 * @description Renders one isolated generated portable-definition module.
 */
export class IconModuleTemplate {
  /**
   * @description Generated ownership banner authority.
   */
  readonly #bannerFactory = new GeneratedFileBannerFactory();

  /**
   * @description Portable definition expression template.
   */
  readonly #definitionTemplate = new IconDefinitionTemplate();

  /**
   * @description Renders one complete LF-terminated icon module.
   * @param candidate - Portable definition paired with deterministic generated names.
   * @returns Byte-stable TypeScript module importing only public Core authority.
   */
  render(candidate: TGenerationCandidate): string {
    return [
      this.#bannerFactory.create(candidate.entry.sourceIds).trimEnd(),
      "",
      'import { Icon as $Icon } from "@aster/core";',
      "",
      "/**",
      ` * @description Portable definition for \`${candidate.name.identityKey}\`.`,
      " */",
      `export const ${candidate.name.symbol} = ${this.#definitionTemplate.render(candidate.entry.definition)};`,
      "",
    ].join("\n");
  }
}
