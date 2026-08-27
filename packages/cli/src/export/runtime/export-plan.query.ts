import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import { exportTargets } from "../constants/export-targets.constant.js";
import type { AsterExportPlan } from "../contracts/index.js";
import { CatalogueExportSelector } from "./catalogue-export.selector.js";
import { SvgExportArtefactFactory } from "./svg-export-artefact.factory.js";

/**
 * @description Coordinates exact selection and complete host-neutral SVG artefact planning.
 */
export class ExportPlanQuery {
  /**
   * @description Exact accepted catalogue-selection boundary.
   */
  readonly #selections: CatalogueExportSelector;

  /**
   * @description Deterministic SVG artefact constructor.
   */
  readonly #artefacts = new SvgExportArtefactFactory();

  /**
   * @description Structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Creates one export query from its exact selection dependency.
   * @param selections - Accepted catalogue-selection boundary.
   */
  constructor(selections: CatalogueExportSelector) {
    this.#selections = selections;
  }

  /**
   * @description Produces one complete immutable export plan without host effects.
   * @param invocation - Canonical structured export request.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Structured immutable plan or deterministic failure.
   */
  async execute(
    invocation: Extract<
      AsterCommandInvocationType,
      { command: typeof asterCommandNames.export }
    >,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    const selection = await this.#selections.select(invocation, context);

    if (!selection.accepted) {
      return this.#results.failure(asterCommandNames.export, selection.diagnostic);
    }

    const artefacts = this.#artefacts.create(selection.value, invocation.options);

    if (!artefacts.accepted) {
      return this.#results.failure(asterCommandNames.export, artefacts.diagnostic);
    }

    const plan: AsterExportPlan = Object.freeze({
      target: exportTargets.svg,
      subject: selection.value.subject,
      catalogue: selection.value.catalogue,
      identity: selection.value.identity,
      artefacts: artefacts.value,
    });

    return this.#results.success(asterCommandNames.export, Object.freeze({
      kind: asterCommandPayloadKinds.export,
      plan,
    }));
  }
}

