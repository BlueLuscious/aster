import type { IconImportApi } from "./contracts/index.js";
import type {
  IconAdoptionRequest,
  IconImportDefinitionRequest,
  IconModuleEmissionRequest,
} from "../adoption/contracts/index.js";
import type { IconImportSourceType } from "../source/types/index.js";
import { IconAdoptionService } from "../adoption/runtime/icon-adoption.service.js";
import { IconImportAdapterRegistry } from "../format/runtime/icon-import-adapter.registry.js";
import { SvgIconImportAdapter } from "../formats/svg/runtime/svg-icon-import.adapter.js";

/**
 * @description Shared stateless adoption service owned by the public Import API boundary.
 */
const iconAdoptionService = new IconAdoptionService(
  new IconImportAdapterRegistry([new SvgIconImportAdapter()]),
);

/**
 * @description Immutable host-independent API for inspecting and adopting external icon sources.
 */
export const IconImport: IconImportApi = Object.freeze({
  /**
   * @description Inspects one explicit acquired source through its exact format adapter.
   * @param source - Format-discriminated source supplied by the host.
   * @returns Neutral draft or blocking source diagnostics.
   */
  inspect(source: IconImportSourceType) {
    return iconAdoptionService.inspect(source);
  },

  /**
   * @description Combines one accepted draft with complete reviewed metadata.
   * @param request - Draft and metadata construction request.
   * @returns Portable definition or blocking metadata diagnostics.
   */
  define(request: IconImportDefinitionRequest) {
    return iconAdoptionService.define(request);
  },

  /**
   * @description Emits one editable isolated TypeScript module.
   * @param request - Accepted definition and source provenance.
   * @returns Editable module or blocking adoption diagnostics.
   */
  emit(request: IconModuleEmissionRequest) {
    return iconAdoptionService.emit(request);
  },

  /**
   * @description Adopts one source into an editable portable definition atomically.
   * @param request - Source and complete reviewed metadata.
   * @returns Complete adoption output or blocking diagnostics.
   */
  adopt(request: IconAdoptionRequest) {
    return iconAdoptionService.adopt(request);
  },

  /**
   * @description Adopts several sources with canonical ordering and no partial output.
   * @param requests - Independent source and metadata requests.
   * @returns Complete canonical batch or blocking diagnostics.
   */
  adoptMany(requests: readonly IconAdoptionRequest[]) {
    return iconAdoptionService.adoptMany(requests);
  },
});
