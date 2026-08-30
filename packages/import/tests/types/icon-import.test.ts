import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
  DiagnosticRelatedContext,
  DiagnosticResultType,
  DiagnosticSeverityType,
  IconAdoptionBatchOutput,
  IconAdoptionOutput,
  IconAdoptionRequest,
  IconImportApi,
  IconImportDefinitionRequest,
  IconImportDraft,
  IconImportFormatType,
  IconImportMetrics,
  IconImportProvenance,
  IconImportSourceType,
  IconModuleEmissionRequest,
  IconModuleOutput,
  SourceDiagnostic,
  SourcePosition,
  SourceSpan,
  SvgIconImportSource,
} from "../../src/index.js";
import {
  IconImport,
  IconImportError,
  iconImportFormats,
} from "../../src/index.js";

const source = {
  format: iconImportFormats.svg,
  sourceId: "icons/check.svg",
  identity: { namespace: "aster", name: "check" },
  content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16" /></svg>',
} satisfies IconImportSourceType;

const api: IconImportApi = IconImport;
const inspected: DiagnosticResultType<IconImportDraft> = api.inspect(source);
const outputs: readonly [
  IconAdoptionOutput?,
  IconAdoptionBatchOutput?,
  IconModuleOutput?,
] = [];
const publicContracts: readonly [
  IconAdoptionRequest?,
  IconImportDefinitionRequest?,
  IconImportMetrics?,
  IconImportProvenance?,
  IconModuleEmissionRequest?,
  SvgIconImportSource?,
  SourceDiagnostic?,
  SourcePosition?,
  SourceSpan?,
  DiagnosticRelatedContext?,
] = [];
const publicVocabularies: readonly [
  IconImportFormatType?,
  DiagnosticCategoryType?,
  DiagnosticSeverityType?,
  DiagnosticCodeType?,
] = [];
const knownDiagnosticCode: DiagnosticCodeType = "ASTER-SAFETY-001";
// @ts-expect-error Unknown diagnostic codes are outside the closed public vocabulary.
const unknownDiagnosticCode: DiagnosticCodeType = "ASTER-SAFETY-999";
const error: typeof IconImportError = IconImportError;

void inspected;
void outputs;
void publicContracts;
void publicVocabularies;
void knownDiagnosticCode;
void unknownDiagnosticCode;
void error;
