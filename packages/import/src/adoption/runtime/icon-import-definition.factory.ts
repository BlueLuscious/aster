import {
  Icon,
  IconDefinitionError,
  type IconDefinition,
} from "@aster/core";
import type { IconImportDefinitionRequest } from "../contracts/index.js";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import { DiagnosticResultFactory } from "../../diagnostic/runtime/diagnostic-result.factory.js";
import { IconAdoptionDiagnosticFactory } from "./icon-adoption-diagnostic.factory.js";

/**
 * @description Combines imported geometry and reviewed metadata through Core authority.
 */
export class IconImportDefinitionFactory {
  /**
   * @description Diagnostic-bearing result construction authority.
   */
  readonly #resultFactory = new DiagnosticResultFactory();

  /**
   * @description Adoption diagnostic authority.
   */
  readonly #diagnosticFactory = new IconAdoptionDiagnosticFactory();

  /**
   * @description Constructs one portable icon without inferring semantic metadata.
   * @param request - Accepted draft and complete host-reviewed metadata.
   * @returns Canonical definition or one blocking adoption diagnostic.
   */
  create(
    request: IconImportDefinitionRequest,
  ): DiagnosticResultType<IconDefinition> {
    try {
      return this.#resultFactory.success(Icon.define({
        identity: request.draft.identity,
        viewBox: request.draft.viewBox,
        nodes: request.draft.nodes,
        metadata: request.metadata,
      }));
    } catch (error: unknown) {
      if (!(error instanceof IconDefinitionError)) {
        throw error;
      }

      return this.#resultFactory.failure([
        this.#diagnosticFactory.invalidDefinition(
          request.draft.provenance.sourceId,
        ),
      ]);
    }
  }
}
