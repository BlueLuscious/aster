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
  /** @description Ownership policy for the malformed document diagnostic code. */
  [diagnosticCodes.malformedDocument]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.syntax,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the invalid viewBox diagnostic code. */
  [diagnosticCodes.invalidViewBox]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.syntax,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the invalid geometry diagnostic code. */
  [diagnosticCodes.invalidGeometry]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.syntax,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the invalid path data diagnostic code. */
  [diagnosticCodes.invalidPathData]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.syntax,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the invalid presentation diagnostic code. */
  [diagnosticCodes.invalidPresentation]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.syntax,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the doctype diagnostic code. */
  [diagnosticCodes.doctype]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the entity reference diagnostic code. */
  [diagnosticCodes.entityReference]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the executable element diagnostic code. */
  [diagnosticCodes.executableElement]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the raster or embedded element diagnostic code. */
  [diagnosticCodes.rasterOrEmbeddedElement]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the event handler diagnostic code. */
  [diagnosticCodes.eventHandler]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the resource reference diagnostic code. */
  [diagnosticCodes.resourceReference]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the foreign namespace diagnostic code. */
  [diagnosticCodes.foreignNamespace]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the processing instruction diagnostic code. */
  [diagnosticCodes.processingInstruction]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the parser limit diagnostic code. */
  [diagnosticCodes.parserLimit]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.safety,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the unsupported element diagnostic code. */
  [diagnosticCodes.unsupportedElement]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the unsupported transform diagnostic code. */
  [diagnosticCodes.unsupportedTransform]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the unsupported text diagnostic code. */
  [diagnosticCodes.unsupportedText]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the unsupported CDATA diagnostic code. */
  [diagnosticCodes.unsupportedCdata]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the unsupported attribute diagnostic code. */
  [diagnosticCodes.unsupportedAttribute]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the empty geometry diagnostic code. */
  [diagnosticCodes.emptyGeometry]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the discarded editor attribute diagnostic code. */
  [diagnosticCodes.discardedEditorAttribute]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.technical,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.warning,
  }),
  /** @description Ownership policy for the invalid definition diagnostic code. */
  [diagnosticCodes.invalidDefinition]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.adoption,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the invalid emission diagnostic code. */
  [diagnosticCodes.invalidEmission]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.adoption,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the duplicate identity diagnostic code. */
  [diagnosticCodes.duplicateIdentity]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.adoption,
    /** @description Diagnostic severity assigned to this diagnostic code. */
    severity: diagnosticSeverities.error,
  }),
  /** @description Ownership policy for the duplicate symbol diagnostic code. */
  [diagnosticCodes.duplicateSymbol]: Object.freeze({
    /** @description Diagnostic category assigned to this diagnostic code. */
    category: diagnosticCategories.adoption,
    /** @description Diagnostic severity assigned to this diagnostic code. */
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
