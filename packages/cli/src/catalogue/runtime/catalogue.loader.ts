import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type { CatalogueProvider } from "../contracts/index.js";
import type { TAcceptedCatalogueDiscovery } from "../types/internal/accepted-catalogue-discovery.type.js";
import { CatalogueDiscoveryNormaliser } from "./catalogue-discovery.normaliser.js";

/**
 * @description Discovers and accepts metadata from explicit catalogue providers.
 */
export class CatalogueLoader {
  /** @description Locale-independent ordering authority for canonical provider identities. */
  readonly #strings = new AsciiStringComparator();

  /** @description Provider discovery acceptance boundary. */
  readonly #discoveries = new CatalogueDiscoveryNormaliser();

  /** @description Immutable diagnostic constructor for rejected provider operations. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Discovers and validates all providers without retaining catalogue state.
   * @param providers - Explicit unique provider sequence supplied by the host.
   * @returns Canonically ordered accepted discovery states or one deterministic rejection.
   */
  async discover(
    providers: readonly CatalogueProvider[],
  ): Promise<TAcceptanceResult<readonly TAcceptedCatalogueDiscovery[]>> {
    const orderedProviders = [...providers].sort((left, right) =>
      this.#strings.compare(left.identity, right.identity),
    );
    const settled = await Promise.allSettled(
      orderedProviders.map((provider) => provider.discover()),
    );
    const catalogues: TAcceptedCatalogueDiscovery[] = [];

    for (const [index, result] of settled.entries()) {
      const provider = orderedProviders[index];

      if (provider === undefined) {
        continue;
      }

      if (result.status === "rejected") {
        return this.#unavailable(
          provider.identity,
          "catalogue provider failed to discover metadata",
        );
      }

      let accepted: TAcceptanceResult<TAcceptedCatalogueDiscovery>;

      try {
        accepted = this.#discoveries.normalise(provider.identity, result.value);
      } catch {
        return this.#unavailable(
          provider.identity,
          "catalogue provider returned unreadable discovery metadata",
        );
      }

      if (!accepted.accepted) {
        return accepted;
      }

      catalogues.push(accepted.value);
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze(catalogues),
    });
  }

  /**
   * @description Creates one sanitised provider-unavailable rejection.
   * @param providerIdentity - Canonical identity of the failing provider.
   * @param message - Stable Aster-owned explanation.
   * @returns Immutable rejected catalogue acceptance result.
   * @typeParam Value - Accepted value family prevented by provider failure.
   */
  #unavailable<Value>(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.catalogueUnavailable,
        commandDiagnosticSchema.codes.catalogueUnavailable,
        message,
        [providerIdentity],
      ),
    });
  }
}
