import type { AsterCommandDescriptor } from "../../../command/contracts/index.js";

/**
 * @description Renders complete or selected command help as deterministic human text.
 */
export class HelpHumanOutputPresenter {
  /**
   * @description Formats immutable command descriptors and presentation guidance.
   * @param descriptors - Canonically ordered help metadata.
   * @returns Deterministic multi-line usage text.
   */
  present(descriptors: readonly AsterCommandDescriptor[]): string {
    const lines = ["Aster commands:"];

    for (const descriptor of descriptors) {
      lines.push(`  ${descriptor.name}: ${descriptor.summary}`);

      for (const usage of descriptor.usage) {
        lines.push(`    aster ${usage}`);
      }
    }

    lines.push("Presentation:", "  --json  Emit one JSON result document.");
    return lines.join("\n");
  }
}
