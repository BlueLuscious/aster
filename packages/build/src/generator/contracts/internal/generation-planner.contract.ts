import type { DiagnosticResultType } from "../../../diagnostic/types/index.js";
import type { IGenerationPlan } from "./generation-plan.contract.js";
import type { IGenerationRequest } from "./generation-request.contract.js";

/**
 * @description Pure boundary that validates and plans one generated collection package.
 */
export interface IGenerationPlanner {
  /**
   * @description Creates a complete plan or blocking generation diagnostics without host effects.
   * @param request - Successful normalised collection generation input.
   * @returns Complete immutable plan or blocking diagnostics without partial output.
   */
  plan(
    request: IGenerationRequest,
  ): DiagnosticResultType<IGenerationPlan>;
}
