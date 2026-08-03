import type { CatalogueProvider } from "../../catalogue/contracts/index.js";
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
  readonly #providerIdentityPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

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
    if (!this.#isRecord(value)) {
      return this.#invalid("expected context to be an object");
    }

    if (!this.#hasExactFields(value, [
      "catalogues",
      "productName",
      "productVersion",
    ])) {
      return this.#invalid("expected only catalogues, productName, and productVersion");
    }

    if (!Array.isArray(value.catalogues)) {
      return this.#invalid("expected context.catalogues to be an array");
    }

    if (!this.#isNonEmptyString(value.productName)) {
      return this.#invalid("expected context.productName to be a non-empty string");
    }

    if (!this.#isNonEmptyString(value.productVersion)) {
      return this.#invalid("expected context.productVersion to be a non-empty string");
    }

    const catalogues: CatalogueProvider[] = [];

    for (const provider of value.catalogues) {
      if (!this.#isProvider(provider)) {
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
        productName: value.productName,
        productVersion: value.productVersion,
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
   * @description Determines whether a candidate is a non-null plain record boundary.
   * @param value - Candidate value.
   * @returns Whether string-keyed fields can be inspected safely.
   */
  #isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /**
   * @description Determines whether a record exposes exactly the accepted own fields.
   * @param value - Record to inspect.
   * @param fields - Closed accepted own-field sequence.
   * @returns Whether no required field is missing and no unknown field is present.
   */
  #hasExactFields(
    value: Record<string, unknown>,
    fields: readonly string[],
  ): boolean {
    const keys = Object.keys(value);
    return keys.length === fields.length && fields.every((field) => Object.hasOwn(value, field));
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
  #isProvider(value: unknown): value is CatalogueProvider {
    return (
      this.#isRecord(value) &&
      typeof value.identity === "string" &&
      this.#providerIdentityPattern.test(value.identity) &&
      typeof value.load === "function"
    );
  }
}
