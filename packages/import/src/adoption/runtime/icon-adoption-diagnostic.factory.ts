import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import { SourceDiagnosticFactory } from "../../diagnostic/runtime/source-diagnostic.factory.js";
import { iconAdoptionDiagnostics } from "../constants/icon-adoption-diagnostics.constant.js";
import type { TIconAdoptionDiagnosticDetails } from "../types/internal/icon-adoption-diagnostic-details.type.js";

/**
 * @description Produces stable diagnostics for rejected adoption operations.
 */
export class IconAdoptionDiagnosticFactory {
  /**
   * @description Canonical source-diagnostic construction authority.
   */
  readonly #factory = new SourceDiagnosticFactory();

  /**
   * @description Reports an invalid portable definition assembled during adoption.
   * @param sourceId - Logical source responsible for the rejected definition.
   * @returns Canonical blocking diagnostic.
   */
  invalidDefinition(sourceId: string): SourceDiagnostic {
    return this.#create(iconAdoptionDiagnostics.invalidDefinition, sourceId);
  }

  /**
   * @description Reports a definition that cannot be emitted safely.
   * @param sourceId - Logical source associated with the rejected emission.
   * @returns Canonical blocking diagnostic.
   */
  invalidEmission(sourceId: string): SourceDiagnostic {
    return this.#create(iconAdoptionDiagnostics.invalidEmission, sourceId);
  }

  /**
   * @description Reports a repeated portable identity in one atomic batch.
   * @param sourceId - Logical source containing the repeated identity.
   * @returns Canonical blocking diagnostic.
   */
  duplicateIdentity(sourceId: string): SourceDiagnostic {
    return this.#create(iconAdoptionDiagnostics.duplicateIdentity, sourceId);
  }

  /**
   * @description Reports an exported TypeScript symbol collision in one atomic batch.
   * @param sourceId - Logical source producing the colliding symbol.
   * @returns Canonical blocking diagnostic.
   */
  duplicateSymbol(sourceId: string): SourceDiagnostic {
    return this.#create(iconAdoptionDiagnostics.duplicateSymbol, sourceId);
  }

  /**
   * @description Creates one adoption diagnostic from stable authority data.
   * @param details - Stable diagnostic code and message.
   * @param sourceId - Canonical logical source identifier.
   * @returns Canonical blocking diagnostic.
   */
  #create(
    details: TIconAdoptionDiagnosticDetails,
    sourceId: string,
  ): SourceDiagnostic {
    return this.#factory.create({
      code: details.code,
      message: details.message,
      sourceId,
    });
  }
}
