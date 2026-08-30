import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
  DiagnosticSeverityType,
} from "../types/index.js";
import { diagnosticCategories } from "./diagnostic-categories.constant.js";
import { diagnosticCodes } from "./diagnostic-codes.constant.js";
import { diagnosticSeverities } from "./diagnostic-severities.constant.js";

/**
 * @description Immutable category and severity policy owned by each stable Import diagnostic code.
 */
export const diagnosticCodePolicy = Object.freeze({
  [diagnosticCodes.malformedDocument]: Object.freeze({
    category: diagnosticCategories.syntax,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.invalidViewBox]: Object.freeze({
    category: diagnosticCategories.syntax,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.invalidGeometry]: Object.freeze({
    category: diagnosticCategories.syntax,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.invalidPathData]: Object.freeze({
    category: diagnosticCategories.syntax,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.invalidPresentation]: Object.freeze({
    category: diagnosticCategories.syntax,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.doctype]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.entityReference]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.executableElement]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.rasterOrEmbeddedElement]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.eventHandler]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.resourceReference]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.foreignNamespace]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.processingInstruction]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.parserLimit]: Object.freeze({
    category: diagnosticCategories.safety,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.unsupportedElement]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.unsupportedTransform]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.unsupportedText]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.unsupportedCdata]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.unsupportedAttribute]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.emptyGeometry]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.discardedEditorAttribute]: Object.freeze({
    category: diagnosticCategories.technical,
    severity: diagnosticSeverities.warning,
  }),
  [diagnosticCodes.invalidDefinition]: Object.freeze({
    category: diagnosticCategories.adoption,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.invalidEmission]: Object.freeze({
    category: diagnosticCategories.adoption,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.duplicateIdentity]: Object.freeze({
    category: diagnosticCategories.adoption,
    severity: diagnosticSeverities.error,
  }),
  [diagnosticCodes.duplicateSymbol]: Object.freeze({
    category: diagnosticCategories.adoption,
    severity: diagnosticSeverities.error,
  }),
} satisfies Readonly<
  Record<
    DiagnosticCodeType,
    Readonly<{
      category: DiagnosticCategoryType;
      severity: DiagnosticSeverityType;
    }>
  >
>);
