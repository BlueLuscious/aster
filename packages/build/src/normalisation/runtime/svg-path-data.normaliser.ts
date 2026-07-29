import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { SvgPathDataInspector } from "../../shared/runtime/svg-path-data.inspector.js";

/**
 * @description Converts validated SVG path text into its deterministic portable spelling.
 */
export class SvgPathDataNormaliser {
  /**
   * @description Accepted path grammar and canonical token authority.
   */
  readonly #inspector = new SvgPathDataInspector();

  /**
   * @description Normalises one previously validated path value.
   * @param value - Exact accepted authored path data.
   * @returns Canonical path data preserving command semantics and geometry.
   */
  normalise(value: string): string {
    const inspection = this.#inspector.inspect(value);

    if (
      !inspection.valid ||
      !inspection.hasDrawingOperation ||
      inspection.canonicalData === undefined
    ) {
      throw new BuildContractError(
        "validatedPath",
        "path data is not valid normalisation input",
      );
    }

    return inspection.canonicalData;
  }
}
