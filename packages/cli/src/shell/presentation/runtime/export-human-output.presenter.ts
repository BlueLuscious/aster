import type { AsterExportPlan } from "../../../export/contracts/index.js";
import type { TExportOutputPublication } from "../../output/types/internal/export-output-publication.type.js";
import { HumanTextFormatter } from "./human-text.formatter.js";

/**
 * @description Renders export plans and publication evidence as deterministic human text.
 */
export class ExportHumanOutputPresenter {
  /**
   * @description Shared sequence and count formatter.
   */
  readonly #text = new HumanTextFormatter();

  /**
   * @description Renders one complete headless export plan.
   * @param plan - Immutable SVG export plan.
   * @returns Raw single-icon SVG or deterministic artefact summary.
   */
  plan(plan: AsterExportPlan): string {
    return plan.artefacts.length === 1
      ? plan.artefacts[0]?.content ?? ""
      : this.#text.sequence(
          "SVG artefacts",
          plan.artefacts.map((artefact) => artefact.path),
        );
  }

  /**
   * @description Renders truthful destination evidence after output publication handling.
   * @param publication - Immutable publication result from the private output host.
   * @returns Plain deterministic publication summary without a final newline.
   */
  publication(publication: TExportOutputPublication): string {
    if (!publication.committed) {
      return `No SVG artefacts were published; output root was not created: ${publication.targetRoot}`;
    }

    return `Exported ${this.#text.count(publication.artefactCount, "SVG artefact")} to ${publication.targetRoot}`;
  }
}
