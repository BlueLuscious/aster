import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { CatalogueGlyphResult } from "../contracts/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
import type { TCatalogueDiscoverySelection } from "../types/internal/catalogue-discovery-selection.type.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";
import { CatalogueLoader } from "./catalogue.loader.js";
import { CatalogueQueryScope } from "./catalogue-query.scope.js";
import { CatalogueResultFactory } from "./catalogue-result.factory.js";

/**
 * @description Resolves exact discovery metadata before any complete definition is loaded.
 */
export class CatalogueDiscoverySelector {
  /** @description Explicit provider discovery and acceptance boundary. */
  readonly #loader: CatalogueLoader;

  /** @description Shared exact-provider scope policy. */
  readonly #scope = new CatalogueQueryScope();

  /** @description Canonical portable identity formatter used for exact matching. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Immutable diagnostic constructor for selection failures. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /** @description Accepted metadata projection shared by glyph list and exact lookup. */
  readonly #results = new CatalogueResultFactory();

  /**
   * @description Creates one selector using the explicit shared discovery loader.
   * @param loader - Provider discovery and metadata acceptance boundary.
   */
  constructor(loader: CatalogueLoader) {
    this.#loader = loader;
  }

  /**
   * @description Resolves one exact icon or collection metadata record.
   * @param subject - Exact portable value family to resolve.
   * @param identity - Canonical textual portable identity.
   * @param catalogue - Optional exact provider filter.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns One immutable discovery selection or deterministic lookup failure.
   */
  async select(
    subject: TCatalogueDiscoverySelection["subject"],
    identity: string,
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TCatalogueDiscoverySelection>> {
    const scoped = await this.#discover(catalogue, context);

    if (!scoped.accepted) {
      return scoped;
    }

    const candidates = subject === asterCommandSubjects.show.icon
      ? this.#icons(scoped.value, identity)
      : this.#collections(scoped.value, identity);

    return this.#one(candidates, identity);
  }

  /**
   * @description Resolves one provider-scoped glyph using accepted metadata only.
   * @param identity - Exact canonical glyph key without a treatment.
   * @param catalogue - Optional exact provider filter.
   * @param context - Accepted discovery capabilities.
   * @returns One immutable glyph or the existing not-found/ambiguity evidence.
   */
  async selectGlyph(
    identity: string,
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<CatalogueGlyphResult>> {
    const scoped = await this.#discover(catalogue, context);
    if (!scoped.accepted) {
      return scoped;
    }

    const candidates = scoped.value.flatMap((provider) => this.#results.glyphs(provider)
      .filter((glyph) => this.#identities.glyph(glyph.identity) === identity));
    return this.#one(candidates, identity);
  }

  /**
   * @description Applies shared acceptance and exact provider scope before record selection.
   * @param catalogue - Optional provider identity.
   * @param context - Accepted discovery capabilities.
   * @returns Ordered accepted scope or sanitised discovery/filter failure.
   */
  async #discover(
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<readonly TAcceptedCatalogueDiscovery[]>> {
    const discovered = await this.#loader.discover(context.catalogues);
    return discovered.accepted
      ? this.#scope.selectCatalogues(discovered.value, catalogue)
      : discovered;
  }

  /**
   * @description Accepts exactly one provider-owned candidate without silently merging duplicates.
   * @typeParam Value - Metadata selection or glyph carrying provider provenance.
   * @param candidates - Canonically ordered matching provider results.
   * @param identity - Exact requested identity used in failure evidence.
   * @returns One result or the existing not-found/ambiguity diagnostic.
   */
  #one<Value extends Readonly<{ /** @description Provider owning the candidate. */ catalogue: string }>>(
    candidates: readonly Value[],
    identity: string,
  ): TAcceptanceResult<Value> {
    const candidate = candidates[0];

    if (candidate === undefined) {
      return this.#failure(
        commandDiagnosticSchema.categories.notFound,
        commandDiagnosticSchema.codes.notFound,
        `identity ${identity} was not found`,
        [identity],
      );
    }

    if (candidates.length > 1) {
      return this.#failure(
        commandDiagnosticSchema.categories.ambiguous,
        commandDiagnosticSchema.codes.ambiguous,
        `identity ${identity} is available from multiple catalogues`,
        candidates.map((candidate) => candidate.catalogue),
      );
    }

    return Object.freeze({
      accepted: true,
      value: candidate,
    });
  }

  /**
   * @description Selects exact icon metadata from canonically ordered catalogues.
   * @param catalogues - Accepted provider discovery scope.
   * @param identity - Canonical textual icon identity.
   * @returns Immutable exact icon metadata selections.
   */
  #icons(
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string,
  ): readonly TCatalogueDiscoverySelection[] {
    return Object.freeze(catalogues.flatMap((catalogue) => catalogue.icons
      .filter((record) => this.#identities.icon(record.identity) === identity)
      .map((record) => Object.freeze({
        catalogue: catalogue.identity,
        subject: asterCommandSubjects.show.icon,
        identity,
        icon: record,
        icons: Object.freeze([record]),
      }))));
  }

  /**
   * @description Selects exact collection metadata from canonically ordered catalogues.
   * @param catalogues - Accepted provider discovery scope.
   * @param identity - Canonical textual collection identity.
   * @returns Immutable exact collection metadata selections.
   */
  #collections(
    catalogues: readonly TAcceptedCatalogueDiscovery[],
    identity: string,
  ): readonly TCatalogueDiscoverySelection[] {
    return Object.freeze(catalogues.flatMap((catalogue) => catalogue.collections
      .filter((record) => this.#identities.collection(record.identity) === identity)
      .map((record) => {
        const memberIdentities = new Set(record.memberIdentities.map((icon) =>
          this.#identities.icon(icon),
        ));

        return Object.freeze({
          catalogue: catalogue.identity,
          subject: asterCommandSubjects.show.collection,
          identity,
          collection: record,
          icons: Object.freeze(catalogue.icons.filter((icon) =>
            memberIdentities.has(this.#identities.icon(icon.identity)),
          )),
        });
      })));
  }

  /**
   * @description Creates one deterministic rejected discovery selection.
   * @param category - Stable command diagnostic category.
   * @param code - Stable command diagnostic code.
   * @param message - Deterministic failure explanation.
   * @param related - Canonically ordered related values.
   * @returns Immutable rejected acceptance result.
   * @typeParam Value - Accepted result family prevented by the lookup failure.
   */
  #failure<Value>(
    category: "not-found" | "ambiguous",
    code: "ASTER-CLI-004" | "ASTER-CLI-005",
    message: string,
    related: readonly string[],
  ): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(category, code, message, related),
    });
  }
}
