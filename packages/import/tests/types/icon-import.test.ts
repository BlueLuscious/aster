import type {
  DiagnosticResultType,
  IconAdoptionBatchOutput,
  IconAdoptionOutput,
  IconImportApi,
  IconImportDraft,
  IconImportSourceType,
  IconModuleOutput,
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
const error: typeof IconImportError = IconImportError;

void inspected;
void outputs;
void error;
