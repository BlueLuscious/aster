import {
  Icon,
  IconDefinitionError,
  type IconDefinition,
} from "@luscious-garden/aster-core";
import type {
  IconModuleEmissionRequest,
  IconModuleOutput,
} from "../contracts/index.js";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { SourceIdValidator } from "../../source/runtime/source-id.validator.js";
import { IconIdentityFormatter } from "../../shared/runtime/icon-identity.formatter.js";
import { IconImportError } from "../../error/index.js";
import { IconAdoptionDiagnosticFactory } from "./icon-adoption-diagnostic.factory.js";
import { IconModuleNameFactory } from "./icon-module-name.factory.js";
import { TypeScriptValueSerialiser } from "./typescript-value.serialiser.js";

/**
 * @description Emits reviewed definitions as editable isolated TypeScript modules.
 */
export class IconModuleEmitter {
  /**
   * @description Editable-module naming authority.
   */
  readonly #nameFactory = new IconModuleNameFactory();

  /**
   * @description Portable-value serialisation authority.
   */
  readonly #serialiser = new TypeScriptValueSerialiser();

  /**
   * @description Logical provenance identifier authority.
   */
  readonly #sourceIdValidator = new SourceIdValidator();

  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Adoption diagnostic authority.
   */
  readonly #diagnosticFactory = new IconAdoptionDiagnosticFactory();

  /**
   * @description Canonical unambiguous portable identity formatter.
   */
  readonly #identityFormatter = new IconIdentityFormatter();

  /**
   * @description Emits one editable module with stable provenance and no generated ownership.
   * @param request - Accepted definition and non-empty logical provenance.
   * @returns Editable module or blocking adoption diagnostic.
   */
  emit(request: IconModuleEmissionRequest): DiagnosticResultType<IconModuleOutput> {
    if (!Array.isArray(request.sourceIds) || request.sourceIds.length === 0) {
      throw new IconImportError("sourceIds", "expected at least one source identifier");
    }

    const sourceIds = Object.freeze(
      [...new Set(request.sourceIds.map((sourceId, index) =>
        this.#sourceIdValidator.validate(sourceId, `sourceIds[${index}]`),
      ))].sort(),
    );
    let definition: IconDefinition;

    try {
      definition = Icon.define(request.definition);
    } catch (error: unknown) {
      if (!(error instanceof IconDefinitionError)) {
        throw error;
      }

      return this.#resultFactory.failure([
        this.#diagnosticFactory.invalidEmission(sourceIds[0] ?? "unknown"),
      ]);
    }

    const name = this.#nameFactory.create(definition);
    const content = [
      'import { Icon as $Icon } from "@luscious-garden/aster-core";',
      "",
      "/**",
      ` * @description Portable definition for \`${this.#identityKey(definition)}\`.`,
      ` * @remarks Initially adopted from: ${this.#provenanceText(sourceIds)}.`,
      " */",
      `export const ${name.exportName} = $Icon.define(${this.#serialiser.serialise(definition)});`,
      "",
    ].join("\n");

    return this.#resultFactory.success(Object.freeze({
      ...name,
      content,
    }));
  }

  /**
   * @description Escapes logical provenance for plain text within an editable definition's JSDoc.
   * @remarks Source identifiers reject line separators. Escaping comment terminators, markup and
   * tag delimiters prevents accepted identifiers from changing the emitted code or documentation.
   * @param sourceIds - Validated, sorted and duplicate-free logical source identifiers.
   * @returns Safe JSDoc text preserving the readable provenance.
   */
  #provenanceText(sourceIds: readonly string[]): string {
    return sourceIds.join(", ")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll("*/", "*&#47;")
      .replaceAll("@", "&#64;")
      .replaceAll("{", "&#123;")
      .replaceAll("}", "&#125;")
      .replaceAll("`", "&#96;");
  }

  /**
   * @description Produces one stable fully qualified identity for module documentation.
   * @param definition - Complete accepted portable definition.
   * @returns Complete `[namespace/]name@variant` identity.
   */
  #identityKey(definition: IconDefinition): string {
    return this.#identityFormatter.format(definition.identity);
  }
}
