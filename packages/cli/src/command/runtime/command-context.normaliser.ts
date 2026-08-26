import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../catalogue/contracts/index.js";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type { TAcceptanceResult } from "../types/internal/acceptance-result.type.js";
import { CommandDiagnosticFactory } from "./command-diagnostic.factory.js";

/**
 * @description Accepts and isolates the complete explicit capability context for one execution.
 */
export class CommandContextNormaliser {
  /**
   * @description Canonical ASCII provider-identity grammar.
   */
  readonly #identities = new CanonicalIdentityValidator();

  /**
   * @description Exact context-record and provider-sequence acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Immutable diagnostic constructor used for rejected contexts.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Validates and isolates one untrusted command context.
   * @param value - Candidate explicit capability context.
   * @returns Accepted immutable context or structured rejection evidence.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandContext> {
    const record = this.#data.record(value, [
      "catalogues",
      "productName",
      "productVersion",
    ], ["catalogues", "productName", "productVersion"]);

    if (record === undefined) {
      return this.#invalid("expected only catalogues, productName, and productVersion");
    }

    const providerValues = this.#data.array(record.catalogues);

    if (providerValues === undefined) {
      return this.#invalid("expected context.catalogues to be an array");
    }

    if (!this.#isNonEmptyString(record.productName)) {
      return this.#invalid("expected context.productName to be a non-empty string");
    }

    if (!this.#isNonEmptyString(record.productVersion)) {
      return this.#invalid("expected context.productVersion to be a non-empty string");
    }

    const catalogues: CatalogueProvider[] = [];

    for (const providerValue of providerValues) {
      const provider = this.#acceptProvider(providerValue);

      if (provider === undefined) {
        return this.#invalid(
          "expected each catalogue provider to expose a canonical identity and load method",
        );
      }

      catalogues.push(provider);
    }

    const identities = catalogues.map((provider) => provider.identity);

    if (new Set(identities).size !== identities.length) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.catalogueConflict,
          commandDiagnosticSchema.codes.catalogueConflict,
          "catalogue provider identities must be unique",
          identities,
        ),
      });
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        catalogues: Object.freeze([...catalogues]),
        productName: record.productName,
        productVersion: record.productVersion,
      }),
    });
  }

  /**
   * @description Creates a structured invalid-context rejection.
   * @param message - Deterministic explanation of the violated context contract.
   * @returns Immutable rejected acceptance result.
   */
  #invalid(message: string): TAcceptanceResult<AsterCommandContext> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.invalidContext,
        message,
      ),
    });
  }

  /**
   * @description Determines whether a candidate is a non-empty string without edge whitespace.
   * @param value - Candidate value.
   * @returns Whether the value is already canonical for product metadata.
   */
  #isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0 && value.trim() === value;
  }

  /**
   * @description Determines whether a candidate satisfies the narrow catalogue-provider shape.
   * @param value - Candidate provider.
   * @returns Whether the provider can be accepted without invoking it.
   */
  #acceptProvider(value: unknown): CatalogueProvider | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }

    const identityMember = this.#dataMember(value, "identity");
    const loadMember = this.#dataMember(value, "load");

    if (
      identityMember === undefined
      || loadMember === undefined
      || !this.#identities.slug(identityMember.value)
      || typeof loadMember.value !== "function"
    ) {
      return undefined;
    }

    const identity = identityMember.value;
    const load = loadMember.value;

    return Object.freeze({
      identity,

      /**
       * @description Invokes the snapshotted provider capability with its original receiver.
       * @returns Provider-owned snapshot candidate for strict downstream acceptance.
       */
      async load(): Promise<CatalogueSnapshot> {
        return Reflect.apply(load, value, []) as Promise<CatalogueSnapshot>;
      },
    });
  }

  /**
   * @description Resolves one data-valued capability member without executing accessors.
   * @param value - Capability object or class instance.
   * @param key - Public contract member to resolve.
   * @returns Snapshotted member value or no value after absence or accessor rejection.
   */
  #dataMember(
    value: object,
    key: string,
  ): Readonly<{ value: unknown }> | undefined {
    let owner: object | null = value;
    const visited = new Set<object>();

    while (owner !== null) {
      if (visited.has(owner)) {
        return undefined;
      }

      visited.add(owner);
      const descriptor = Object.getOwnPropertyDescriptor(owner, key);

      if (descriptor !== undefined) {
        return "value" in descriptor
          ? Object.freeze({ value: descriptor.value })
          : undefined;
      }

      owner = Object.getPrototypeOf(owner) as object | null;
    }

    return undefined;
  }
}
