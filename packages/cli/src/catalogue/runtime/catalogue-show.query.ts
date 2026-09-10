import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import { CatalogueResultFactory } from "./catalogue-result.factory.js";
import { CatalogueSubjectSelector } from "./catalogue-subject.selector.js";

/**
 * @description Executes exact icon and collection lookup with explicit ambiguity handling.
 */
export class CatalogueShowQuery {
  /**
   * @description Shared exact portable-value selection boundary.
   */
  readonly #selections: CatalogueSubjectSelector;

  /**
   * @description Accepted catalogue-record result projector.
   */
  readonly #catalogueResults = new CatalogueResultFactory();

  /**
   * @description Structured command outcome constructor.
   */
  readonly #commandResults = new CommandResultFactory();

  /**
   * @description Creates one exact lookup query using the shared selection boundary.
   * @param selections - Exact provider and portable-value selection authority.
   */
  constructor(selections: CatalogueSubjectSelector) {
    this.#selections = selections;
  }

  /**
   * @description Resolves one exact portable identity in the accepted provider scope.
   * @param invocation - Canonical show invocation.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Structured immutable exact result or lookup failure.
   */
  async execute(
    invocation: Extract<AsterCommandInvocationType, { command: typeof asterCommandNames.show }>,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    const selected = await this.#selections.select(
      invocation.subject,
      invocation.identity,
      invocation.catalogue,
      context,
    );

    if (!selected.accepted) {
      return this.#commandResults.failure(asterCommandNames.show, selected.diagnostic);
    }

    if (invocation.subject === asterCommandSubjects.show.icon) {
      const icon = selected.value.icons[0];

      if (icon === undefined) {
        throw new TypeError("Missing selected icon result");
      }

      return this.#commandResults.success(asterCommandNames.show, Object.freeze({
        kind: asterCommandPayloadKinds.iconShow,
        icon: this.#catalogueResults.icon(selected.value.catalogue, icon),
      }));
    }

    if (selected.value.collection === undefined) {
      throw new TypeError("Missing selected collection result");
    }

    return this.#commandResults.success(asterCommandNames.show, Object.freeze({
      kind: asterCommandPayloadKinds.collectionShow,
      collection: this.#catalogueResults.collection(
        selected.value.catalogue,
        selected.value.collection,
      ),
    }));
  }
}
