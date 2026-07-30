import type { DiagnosticResultType } from "../../src/diagnostic/types/index.js";
import type { IGenerationPlan } from "../../src/generator/contracts/internal/generation-plan.contract.js";
import type { IGenerationPlanner } from "../../src/generator/contracts/internal/generation-planner.contract.js";
import type { IGenerationRequest } from "../../src/generator/contracts/internal/generation-request.contract.js";
import { GenerationPlanner } from "../../src/generator/runtime/generation.planner.js";

const planner: IGenerationPlanner = new GenerationPlanner();
const request = {} as IGenerationRequest;
const result: DiagnosticResultType<IGenerationPlan> = planner.plan(request);

if (result.successful) {
  const firstFile = result.value.files[0];

  if (firstFile !== undefined) {
    const path: string = firstFile.path;
    void path;

    // @ts-expect-error Planned files are immutable.
    firstFile.path = "changed.ts";
  }

  // @ts-expect-error Planned file collections are immutable.
  result.value.files.push({ path: "new.ts", content: "" });
} else {
  const firstDiagnostic = result.diagnostics[0];

  if (firstDiagnostic !== undefined) {
    const code: `ASTER-${string}-${number}` = firstDiagnostic.code;
    void code;
  }
}
