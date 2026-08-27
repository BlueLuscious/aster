import { asterCommandPayloadKinds } from "../../../command/constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandResultType } from "../../../command/types/index.js";
import type { TExportOutputPublication } from "../../output/types/internal/export-output-publication.type.js";
import { CatalogueHumanOutputPresenter } from "./catalogue-human-output.presenter.js";
import { ExportHumanOutputPresenter } from "./export-human-output.presenter.js";
import { HelpHumanOutputPresenter } from "./help-human-output.presenter.js";

/**
 * @description Dispatches structured command results to deterministic human-text collaborators.
 */
export class HumanOutputPresenter {
  /**
   * @description Catalogue discovery payload presenter.
   */
  readonly #catalogue = new CatalogueHumanOutputPresenter();

  /**
   * @description Export plan and publication presenter.
   */
  readonly #export = new ExportHumanOutputPresenter();

  /**
   * @description Command help presenter.
   */
  readonly #help = new HelpHumanOutputPresenter();

  /**
   * @description Renders truthful destination evidence after output publication handling.
   * @param publication - Immutable publication result from the private output host.
   * @returns Plain deterministic publication summary without a final newline.
   */
  publication(publication: TExportOutputPublication): string {
    return this.#export.publication(publication);
  }

  /**
   * @description Renders one successful command result without a final newline.
   * @param result - Structured immutable successful command result.
   * @returns Plain deterministic success text.
   */
  success(result: Extract<AsterCommandResultType, { ok: true }>): string {
    const payload = result.payload;

    switch (payload.kind) {
      case asterCommandPayloadKinds.export:
        return this.#export.plan(payload.plan);
      case asterCommandPayloadKinds.catalogueList:
      case asterCommandPayloadKinds.collectionList:
      case asterCommandPayloadKinds.iconList:
      case asterCommandPayloadKinds.search:
      case asterCommandPayloadKinds.iconShow:
      case asterCommandPayloadKinds.collectionShow:
        return this.#catalogue.present(payload);
      case asterCommandPayloadKinds.help:
        return this.#help.present(payload.descriptors);
      case asterCommandPayloadKinds.version:
        return `${payload.productName} ${payload.productVersion}`;
    }
  }

  /**
   * @description Renders one failed command result without a final newline.
   * @param result - Structured immutable failed command result.
   * @returns Plain deterministic diagnostic text.
   */
  failure(result: Extract<AsterCommandResultType, { ok: false }>): string {
    const related = result.diagnostic.related;
    return [
      `[${result.diagnostic.code}] ${result.diagnostic.message}`,
      ...(related === undefined || related.length === 0
        ? []
        : [`Related: ${related.join(", ")}`]),
    ].join("\n");
  }
}
