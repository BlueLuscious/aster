import type { AsterCommandDescriptor } from "../../../command/contracts/index.js";
import { HumanTextFormatter } from "./human-text.formatter.js";

/**
 * @description Renders complete or selected command help as deterministic human text.
 */
export class HelpHumanOutputPresenter {
  /** @description Shared visible representation for descriptor data without changing help hierarchy. */
  readonly #text = new HumanTextFormatter();

  /**
   * @description Formats immutable command descriptors and presentation guidance.
   * @param descriptors - Canonically ordered help metadata.
   * @returns Deterministic multi-line usage text.
   */
  present(descriptors: readonly AsterCommandDescriptor[]): string {
    const lines = ["Aster commands:"];

    for (const descriptor of descriptors) {
      lines.push(
        `  ${this.#text.value(descriptor.name)}: ${this.#text.value(descriptor.summary)}`,
      );

      for (const usage of descriptor.usage) {
        lines.push(`    aster ${this.#text.value(usage)}`);
      }
    }

    lines.push("Presentation:", "  --json  Emit one JSON result document.");
    return lines.join("\n");
  }
}
