import type { AsterCommandContext } from "../../command/contracts/index.js";
import type { AsterCommandShowSubjectType } from "../../command/types/index.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { TCatalogueSelection } from "../types/internal/catalogue-selection.type.js";
import { CatalogueDefinitionResolver } from "./catalogue-definition.resolver.js";
import { CatalogueDiscoverySelector } from "./catalogue-discovery.selector.js";

/**
 * @description Coordinates metadata selection and exact definition resolution for one subject.
 */
export class CatalogueSubjectSelector {
  /** @description Exact metadata-selection boundary executed before definition loading. */
  readonly #discoveries: CatalogueDiscoverySelector;

  /** @description Exact definition resolver applied only to the accepted metadata selection. */
  readonly #definitions: CatalogueDefinitionResolver;

  /**
   * @description Creates one selector from independent discovery and definition boundaries.
   * @param discoveries - Exact metadata-selection boundary.
   * @param definitions - Exact definition-resolution boundary.
   */
  constructor(
    discoveries: CatalogueDiscoverySelector,
    definitions: CatalogueDefinitionResolver,
  ) {
    this.#discoveries = discoveries;
    this.#definitions = definitions;
  }

  /**
   * @description Selects metadata before loading and validating only its exact definition.
   * @param subject - Exact portable value family to resolve.
   * @param identity - Canonical textual portable identity.
   * @param catalogue - Optional exact provider filter.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns One immutable complete selection or deterministic lookup or provider failure.
   */
  async select(
    subject: AsterCommandShowSubjectType,
    identity: string,
    catalogue: string | undefined,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TCatalogueSelection>> {
    const discovery = await this.#discoveries.select(
      subject,
      identity,
      catalogue,
      context,
    );

    return discovery.accepted
      ? this.#definitions.resolve(discovery.value, context)
      : discovery;
  }
}
