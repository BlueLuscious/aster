import { asterCommandNames } from "../../command/constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandResultFactory } from "../../command/runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../command/types/index.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
} from "../contracts/index.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";
import { CatalogueResultFactory } from "./catalogue-result.factory.js";

/**
 * @description Executes deterministic mixed icon and collection catalogue search.
 */
export class CatalogueSearchQuery {
  /**
   * @description Explicit provider loading and snapshot acceptance boundary.
   */
  readonly #loader: CatalogueLoader;

  /**
   * @description Shared exact-filter policy.
   */
  readonly #scope = new CatalogueQueryScope();

  /**
   * @description Canonical portable identity formatter used by matching and ordering.
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
   * @description Canonical deterministic string-ordering policy.
   */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Creates one search query using the explicit shared provider loader.
   * @param loader - Provider loading and snapshot acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Searches canonical identity, display name, tags, and provider-owned terms.
   * @param invocation - Canonical search invocation.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Structured immutable mixed search result.
   */
  async execute(
    invocation: Extract<AsterCommandInvocationType, { command: typeof asterCommandNames.search }>,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    const loaded = await this.#loader.load(context.catalogues);

    if (!loaded.accepted) {
      return this.#commandResults.failure(asterCommandNames.search, loaded.diagnostic);
    }

    const selected = this.#scope.selectCatalogues(loaded.value, invocation.catalogue);

    if (!selected.accepted) {
      return this.#commandResults.failure(asterCommandNames.search, selected.diagnostic);
    }

    const collection = this.#scope.acceptCollection(selected.value, invocation.collection);

    if (!collection.accepted) {
      return this.#commandResults.failure(asterCommandNames.search, collection.diagnostic);
    }

    const terms = invocation.query.split(/\s+/u);
    const results: (CatalogueIconResult | CatalogueCollectionResult)[] = [];

    for (const catalogue of selected.value) {
      for (const record of catalogue.icons) {
        if (
          this.#scope.matchesCollection(record, invocation.collection) &&
          this.#scope.matchesTags(record.definition.metadata.tags, invocation.tags) &&
          this.#matchesTerms([
            this.#identities.icon(record.definition.identity),
            record.definition.metadata.displayName.toLowerCase(),
            ...(record.definition.metadata.tags ?? []),
            ...(record.searchTerms ?? []),
          ], terms)
        ) {
          results.push(this.#catalogueResults.icon(catalogue.identity, record));
        }
      }

      for (const record of catalogue.collections) {
        const identity = this.#identities.collection(record.definition.identity);

        if (
          (invocation.collection === undefined || invocation.collection === identity) &&
          this.#scope.matchesTags(record.definition.metadata.tags, invocation.tags) &&
          this.#matchesTerms([
            identity,
            record.definition.metadata.displayName.toLowerCase(),
            ...(record.definition.metadata.tags ?? []),
            ...(record.searchTerms ?? []),
          ], terms)
        ) {
          results.push(this.#catalogueResults.collection(catalogue.identity, record.definition));
        }
      }
    }

    results.sort((left, right) => this.#compareResults(left, right));

    return this.#commandResults.success(asterCommandNames.search, Object.freeze({
      kind: asterCommandPayloadKinds.search,
      results: Object.freeze(results),
    }));
  }

  /**
   * @description Determines whether every query term occurs in at least one searchable field.
   * @param fields - Canonical lowercase searchable values.
   * @param terms - Normalised non-empty query terms.
   * @returns Whether the record satisfies all terms.
   */
  #matchesTerms(fields: readonly string[], terms: readonly string[]): boolean {
    return terms.every((term) => fields.some((field) => field.includes(term)));
  }

  /**
   * @description Compares mixed results by provider, portable identity, and stable kind.
   * @param left - Left catalogue result.
   * @param right - Right catalogue result.
   * @returns Negative, zero, or positive canonical relation.
   */
  #compareResults(
    left: CatalogueIconResult | CatalogueCollectionResult,
    right: CatalogueIconResult | CatalogueCollectionResult,
  ): number {
    const leftIdentity = left.kind === asterCommandSubjects.show.icon
      ? this.#identities.icon(left.identity)
      : this.#identities.collection(left.identity);
    const rightIdentity = right.kind === asterCommandSubjects.show.icon
      ? this.#identities.icon(right.identity)
      : this.#identities.collection(right.identity);
    const leftKey = `${left.catalogue}\u0000${leftIdentity}\u0000${left.kind}`;
    const rightKey = `${right.catalogue}\u0000${rightIdentity}\u0000${right.kind}`;
    return this.#strings.compare(leftKey, rightKey);
  }
}
