import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import type { CatalogueProvider } from "../contracts/index.js";
import type { TAcceptedCatalogue } from "../types/internal/accepted-catalogue.type.js";
import { CatalogueSnapshotNormaliser } from "./catalogue-snapshot.normaliser.js";

/**
 * @description Loads every explicit provider once and accepts results in canonical provider order.
 */
export class CatalogueLoader {
  /**
   * @description Locale-independent ordering authority for canonical provider identities.
   */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Provider snapshot acceptance boundary.
   */
  readonly #snapshots = new CatalogueSnapshotNormaliser();

  /**
   * @description Immutable diagnostic constructor for rejected provider operations.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Loads and validates all providers without retaining catalogue state.
   * @param providers - Explicit unique provider sequence supplied by the host.
   * @returns Canonically ordered accepted catalogues or one deterministic rejection.
   */
  async load(
    providers: readonly CatalogueProvider[],
  ): Promise<TAcceptanceResult<readonly TAcceptedCatalogue[]>> {
    const orderedProviders = [...providers].sort((left, right) =>
      this.#strings.compare(left.identity, right.identity),
    );
    const settled = await Promise.allSettled(
      orderedProviders.map((provider) => provider.load()),
    );
    const catalogues: TAcceptedCatalogue[] = [];

    for (const [index, result] of settled.entries()) {
      const provider = orderedProviders[index];

      if (provider === undefined) {
        continue;
      }

      if (result.status === "rejected") {
        return this.#unavailable(
          provider.identity,
          "catalogue provider failed to load",
        );
      }

      let accepted: TAcceptanceResult<TAcceptedCatalogue>;

      try {
        accepted = this.#snapshots.normalise(provider.identity, result.value);
      } catch {
        return this.#unavailable(
          provider.identity,
          "catalogue provider returned an unreadable snapshot",
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
   */
  #unavailable(
    providerIdentity: string,
    message: string,
  ): TAcceptanceResult<readonly TAcceptedCatalogue[]> {
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
