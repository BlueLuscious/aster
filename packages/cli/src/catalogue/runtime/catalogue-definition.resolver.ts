import {
  Collection,
  Icon,
  type CollectionDefinition,
  type IconDefinition,
} from "@luscious-garden/aster-core";
import { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../../command/contracts/index.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type { CatalogueProvider } from "../contracts/index.js";
import type { TCatalogueDiscoverySelection } from "../types/internal/catalogue-discovery-selection.type.js";
import type { TCatalogueSelection } from "../types/internal/catalogue-selection.type.js";
import type { TCatalogueSelectedIcon } from "../types/internal/catalogue-selected-icon.type.js";
import { CatalogueDefinitionConsistencyValidator } from "./catalogue-definition-consistency.validator.js";
import { CatalogueIdentityFormatter } from "./catalogue-identity.formatter.js";

/**
 * @description Resolves one selected discovery record through its exact provider capability.
 */
export class CatalogueDefinitionResolver {
  /** @description Discovery-to-definition consistency authority. */
  readonly #consistency = new CatalogueDefinitionConsistencyValidator();

  /** @description Canonical identity formatter used for loaded member indexing. */
  readonly #identities = new CatalogueIdentityFormatter();

  /** @description Immutable diagnostic constructor for exact-resolution failures. */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Resolves and isolates one exact icon or collection selection.
   * @param selection - Accepted metadata selection resolved before definition loading.
   * @param context - Accepted explicit catalogue capabilities.
   * @returns Complete immutable selection or sanitised provider failure.
   */
  async resolve(
    selection: TCatalogueDiscoverySelection,
    context: AsterCommandContext,
  ): Promise<TAcceptanceResult<TCatalogueSelection>> {
    const provider = context.catalogues.find(
      (candidate) => candidate.identity === selection.catalogue,
    );

    if (provider === undefined) {
      return this.#unavailable(
        selection,
        "selected catalogue provider became unavailable",
      );
    }

    return selection.subject === asterCommandSubjects.show.icon
      ? this.#icon(selection, provider)
      : this.#collection(selection, provider);
  }

  /**
   * @description Loads, validates, and isolates one exact selected icon definition.
   * @param selection - Accepted icon discovery selection.
   * @param provider - Exact selected provider capability.
   * @returns Complete immutable icon selection or sanitised provider failure.
   */
  async #icon(
    selection: TCatalogueDiscoverySelection,
    provider: CatalogueProvider,
  ): Promise<TAcceptanceResult<TCatalogueSelection>> {
    const record = selection.icon;

    if (record === undefined || selection.icons.length !== 1) {
      return this.#unavailable(selection, "selected icon discovery is inconsistent");
    }

    let candidate: IconDefinition | undefined;

    try {
      candidate = await provider.loadIcon(record.identity);
    } catch {
      return this.#unavailable(selection, "selected icon loader failed");
    }

    if (candidate === undefined) {
      return this.#unavailable(selection, "selected icon definition is unavailable");
    }

    let definition: IconDefinition;

    try {
      definition = Icon.define(candidate);
    } catch {
      return this.#unavailable(selection, "selected icon definition is invalid");
    }

    const failure = this.#consistency.icon(record, definition);

    if (failure !== undefined) {
      return this.#unavailable(selection, failure);
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        catalogue: selection.catalogue,
        subject: selection.subject,
        identity: selection.identity,
        icons: Object.freeze([Object.freeze({
          definition,
          memberships: record.memberships,
        })]),
      }),
    });
  }

  /**
   * @description Loads, validates, and isolates one exact selected collection definition.
   * @param selection - Accepted collection discovery selection.
   * @param provider - Exact selected provider capability.
   * @returns Complete immutable collection selection or sanitised provider failure.
   */
  async #collection(
    selection: TCatalogueDiscoverySelection,
    provider: CatalogueProvider,
  ): Promise<TAcceptanceResult<TCatalogueSelection>> {
    const record = selection.collection;

    if (record === undefined) {
      return this.#unavailable(
        selection,
        "selected collection discovery is inconsistent",
      );
    }

    let candidate: CollectionDefinition | undefined;

    try {
      candidate = await provider.loadCollection(record.identity);
    } catch {
      return this.#unavailable(selection, "selected collection loader failed");
    }

    if (candidate === undefined) {
      return this.#unavailable(
        selection,
        "selected collection definition is unavailable",
      );
    }

    let definition: CollectionDefinition;

    try {
      definition = Collection.define(candidate);
    } catch {
      return this.#unavailable(selection, "selected collection definition is invalid");
    }

    const failure = this.#consistency.collection(
      record,
      selection.icons,
      definition,
    );

    if (failure !== undefined) {
      return this.#unavailable(selection, failure);
    }

    const definitionsByIdentity = new Map(definition.members.map((icon) => [
      this.#identities.icon(icon.identity),
      icon,
    ]));
    const icons: TCatalogueSelectedIcon[] = [];

    for (const icon of selection.icons) {
      const memberDefinition = definitionsByIdentity.get(
        this.#identities.icon(icon.identity),
      );

      if (memberDefinition === undefined) {
        return this.#unavailable(
          selection,
          "selected collection definition omitted a discovered member",
        );
      }

      icons.push(Object.freeze({
        definition: memberDefinition,
        memberships: icon.memberships,
      }));
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        catalogue: selection.catalogue,
        subject: selection.subject,
        identity: selection.identity,
        collection: definition,
        icons: Object.freeze(icons),
      }),
    });
  }

  /**
   * @description Creates one sanitised exact-resolution failure.
   * @param selection - Accepted selection that could not be resolved.
   * @param message - Stable Aster-owned explanation.
   * @returns Immutable rejected definition-resolution result.
   * @typeParam Value - Accepted value family prevented by provider failure.
   */
  #unavailable<Value>(
    selection: TCatalogueDiscoverySelection,
    message: string,
  ): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.catalogueUnavailable,
        commandDiagnosticSchema.codes.catalogueUnavailable,
        message,
        [selection.catalogue, selection.identity],
      ),
    });
  }
}
