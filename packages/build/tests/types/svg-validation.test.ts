import type { DiagnosticResultType } from "../../src/diagnostic/types/index.js";
import type { ISvgValidationEvidence } from "../../src/validation/contracts/internal/svg-validation-evidence.contract.js";
import type { ISvgValidationUnit } from "../../src/validation/contracts/internal/svg-validation-unit.contract.js";
import type { ISvgValidator } from "../../src/validation/contracts/internal/svg-validator.contract.js";
import type * as BuildRoot from "../../src/index.js";
import { CollectionValidationContractFactory } from "../../src/validation/runtime/collection-validation-contract.factory.js";
import { SvgValidator } from "../../src/validation/runtime/svg.validator.js";

const validator: ISvgValidator = new SvgValidator();
const contract = new CollectionValidationContractFactory().create({
  collection: "minimal",
  grid: {
    step: 0.5,
    severity: "warning",
  },
});

declare const unit: ISvgValidationUnit;

const result: DiagnosticResultType<ISvgValidationEvidence> =
  validator.validate(unit);

void contract;
void result;

type BuildRootExportsValidation =
  "SvgValidator" extends keyof typeof BuildRoot ? true : false;

// @ts-expect-error Validation services are private Build implementation details.
const rootExportsValidation: BuildRootExportsValidation = true;

void rootExportsValidation;
