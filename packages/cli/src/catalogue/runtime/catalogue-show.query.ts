import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";
import { CatalogueResultFactory } from "./catalogue-result.factory.js";

/**
 * @description Executes exact icon and collection lookup with explicit ambiguity handling.
 */
export class CatalogueShowQuery {
  /**
   * @description Explicit provider loading and snapshot acceptance boundary.
   */
  readonly #loader: CatalogueLoader;

  /**
   * @description Shared exact-provider scope policy.
   */
  readonly #scope = new CatalogueQueryScope();

  /**
   * @description Canonical portable identity formatter used by exact matching.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Accepted catalogue-record result projector.
   */
  readonly #catalogueResults = new CatalogueResultFactory();

  /**
   * @description Structured command outcome constructor.
   */
  readonly #commandResults = new CommandResultFactory();

  /**
   * @description Immutable diagnostic constructor for lookup failures.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Creates one exact lookup query using the explicit shared provider loader.
   * @param loader - Provider loading and snapshot acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
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
    const loaded = await this.#loader.load(context.catalogues);

    if (!loaded.accepted) {
      return this.#commandResults.failure(asterCommandNames.show, loaded.diagnostic);
    }

    const selected = this.#scope.selectCatalogues(loaded.value, invocation.catalogue);

    if (!selected.accepted) {
      return this.#commandResults.failure(asterCommandNames.show, selected.diagnostic);
    }

    if (invocation.subject === asterCommandSubjects.show.icon) {
      const exact = this.#acceptExact(
        selected.value.flatMap((catalogue) => catalogue.icons
          .filter((record) => this.#identities.icon(record.definition.identity) === invocation.identity)
          .map((record) => this.#catalogueResults.icon(catalogue.identity, record))),
        invocation.identity,
      );

      if (!exact.accepted) {
        return this.#commandResults.failure(asterCommandNames.show, exact.diagnostic);
      }

      return this.#commandResults.success(asterCommandNames.show, Object.freeze({
        kind: asterCommandPayloadKinds.iconShow,
        icon: exact.value,
      }));
    }

    const exact = this.#acceptExact(
      selected.value.flatMap((catalogue) => catalogue.collections
        .filter((record) => this.#identities.collection(record.definition.identity) === invocation.identity)
        .map((record) => this.#catalogueResults.collection(catalogue.identity, record.definition))),
      invocation.identity,
    );

    if (!exact.accepted) {
      return this.#commandResults.failure(asterCommandNames.show, exact.diagnostic);
    }

    return this.#commandResults.success(asterCommandNames.show, Object.freeze({
      kind: asterCommandPayloadKinds.collectionShow,
      collection: exact.value,
    }));
  }

  /**
   * @description Accepts exactly one result or returns not-found or ambiguity evidence.
   * @param matches - Canonically ordered exact identity matches.
   * @param identity - Requested canonical portable identity.
   * @returns One exact result or structured lookup rejection.
   * @typeParam Result - Concrete icon or collection result family.
   */
  #acceptExact<Result extends CatalogueIconResult | CatalogueCollectionResult>(
    matches: readonly Result[],
    identity: string,
  ): TAcceptanceResult<Result> {
    if (matches.length === 0) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.notFound,
          commandDiagnosticSchema.codes.notFound,
          `identity ${identity} was not found`,
          [identity],
        ),
      });
    }

    if (matches.length > 1) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.ambiguous,
          commandDiagnosticSchema.codes.ambiguous,
          `identity ${identity} is available from multiple catalogues`,
          matches.map((match) => match.catalogue),
        ),
      });
    }

    return Object.freeze({ accepted: true, value: matches[0] as Result });
  }
}
