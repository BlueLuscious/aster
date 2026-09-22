import { CatalogueSubjectSelector } from "../../catalogue/runtime/catalogue-subject.selector.js";
import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import { reviewTargets } from "../constants/review-targets.constant.js";
import type { AsterReviewPlan } from "../contracts/index.js";
import { ReviewDocumentFactory } from "./review-document.factory.js";

/**
 * @description Coordinates exact selection and complete host-neutral review planning.
 */
export class ReviewPlanQuery {
  /**
   * @description Shared exact catalogue-selection boundary.
   */
  readonly #selections: CatalogueSubjectSelector;

  /**
   * @description Deterministic technical review-model constructor.
   */
  readonly #documents = new ReviewDocumentFactory();

  /**
   * @description Structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Creates one review query from its exact selection dependency.
   * @param selections - Shared accepted catalogue-selection boundary.
   */
  constructor(selections: CatalogueSubjectSelector) {
    this.#selections = selections;
  }

  /**
   * @description Produces one complete immutable review plan without host effects.
   * @param invocation - Canonical structured review request.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Structured immutable plan or deterministic failure.
   */
  async execute(
    invocation: Extract<
      AsterCommandInvocationType,
      {
        /** @description Review-command discriminator used for invocation narrowing. */
        command: typeof asterCommandNames.review;
      }
    >,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    const selection = await this.#selections.select(
      invocation.subject,
      invocation.identity,
      invocation.catalogue,
      context,
    );

    if (!selection.accepted) {
      return this.#results.failure(asterCommandNames.review, selection.diagnostic);
    }

    const document = this.#documents.create(selection.value);

    if (!document.accepted) {
      return this.#results.failure(asterCommandNames.review, document.diagnostic);
    }

    const plan: AsterReviewPlan = Object.freeze({
      target: reviewTargets.html,
      subject: selection.value.subject,
      catalogue: selection.value.catalogue,
      identity: selection.value.identity,
      document: document.value,
    });

    return this.#results.success(asterCommandNames.review, Object.freeze({
      kind: asterCommandPayloadKinds.review,
      plan,
    }));
  }
}
