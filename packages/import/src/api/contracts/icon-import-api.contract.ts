import type { IconDefinition } from "@aster/core";
import type {
  IconAdoptionBatchOutput,
  IconAdoptionOutput,
  IconAdoptionRequest,
  IconImportDefinitionRequest,
  IconImportDraft,
  IconModuleEmissionRequest,
  IconModuleOutput,
} from "../../adoption/contracts/index.js";
import type { DiagnosticResultType } from "../../diagnostic/types/index.js";
import type { IconImportSourceType } from "../../source/types/index.js";

/**
 * @description Public host-independent icon import and adoption operations.
 */
export interface IconImportApi {
  /**
   * @description Inspects one explicit acquired source through its exact format adapter.
   * @param source - Format-discriminated source supplied by the host.
   * @returns Neutral draft or blocking source diagnostics.
   */
  inspect(source: IconImportSourceType): DiagnosticResultType<IconImportDraft>;

  /**
   * @description Combines one accepted draft with complete reviewed metadata.
   * @param request - Draft and metadata construction request.
   * @returns Portable definition or blocking metadata diagnostics.
   */
  define(
    request: IconImportDefinitionRequest,
  ): DiagnosticResultType<IconDefinition>;

  /**
   * @description Emits one editable isolated TypeScript module.
   * @param request - Accepted definition and source provenance.
   * @returns Editable module or blocking adoption diagnostics.
   */
  emit(
    request: IconModuleEmissionRequest,
  ): DiagnosticResultType<IconModuleOutput>;

  /**
   * @description Adopts one source into a definition and editable module atomically.
   * @param request - Source and complete reviewed metadata.
   * @returns Complete adoption output or blocking diagnostics.
   */
  adopt(
    request: IconAdoptionRequest,
  ): DiagnosticResultType<IconAdoptionOutput>;

  /**
   * @description Adopts several sources with canonical ordering and no partial output.
   * @param requests - Independent source and metadata requests.
   * @returns Complete canonical batch or blocking diagnostics.
   */
  adoptMany(
    requests: readonly IconAdoptionRequest[],
  ): DiagnosticResultType<IconAdoptionBatchOutput>;
}
