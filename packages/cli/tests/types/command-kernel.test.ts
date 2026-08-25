import type {
  AsterCommandContext,
  AsterCommandDescriptor,
  AsterCommandDiagnosticCategoryType,
  AsterCommandDiagnosticCodeType,
  AsterCommandDiagnosticType,
  AsterCommandInvocationType,
  AsterCommandListSubjectType,
  AsterCommandNameType,
  AsterCommandPayloadKindType,
  AsterCommandPayloadType,
  AsterCommandResultType,
  AsterCommandSet,
  AsterExportArtefact,
  AsterExportOptionsType,
  AsterExportPlan,
  AsterExportSubjectType,
  AsterIconExportOptionsType,
  AsterCommandShowSubjectType,
  CatalogueProvider,
  CatalogueProviderResult,
  CatalogueIconResult,
  CatalogueCollectionResult,
  CatalogueResultKindType,
  CatalogueSnapshot,
} from "../../src/index.js";
import {
  AsterCatalogue,
  AsterCommands,
  catalogueResultKinds,
  exportTargets,
} from "../../src/index.js";

const snapshot: CatalogueSnapshot = {
  icons: [],
  collections: [],
};

const provider: CatalogueProvider = {
  identity: "testing",
  async load(): Promise<CatalogueSnapshot> {
    return snapshot;
  },
};

const context: AsterCommandContext = {
  catalogues: [provider],
  productName: "Aster",
  productVersion: "0.0.0",
};

const descriptor: AsterCommandDescriptor = {
  name: "search",
  summary: "Search installed catalogues.",
  usage: ["search <query>"],
};

const commandName: AsterCommandNameType = descriptor.name;
const listSubject: AsterCommandListSubjectType = "icons";
const showSubject: AsterCommandShowSubjectType = "icon";
const diagnosticCode: AsterCommandDiagnosticCodeType = "ASTER-CLI-004";
const diagnosticCategory: AsterCommandDiagnosticCategoryType = "not-found";
const payloadKind: AsterCommandPayloadKindType = "icon-list";
const catalogueResultKind: CatalogueResultKindType = catalogueResultKinds.icon;
const exportSubject: AsterExportSubjectType = "icon";
const exportOptions: AsterExportOptionsType = {
  size: 24,
  direction: "ltr",
};
const iconExportOptions: AsterIconExportOptionsType = {
  ...exportOptions,
  label: "Camera",
};
const exportInvocation: AsterCommandInvocationType = {
  command: "export",
  subject: "icon",
  identity: "aster/camera",
  options: iconExportOptions,
};
const exportArtefact: AsterExportArtefact = {
  path: "aster/camera.svg",
  mediaType: "image/svg+xml",
  content: "<svg></svg>",
};
const exportPlan: AsterExportPlan = {
  target: exportTargets.svg,
  subject: exportSubject,
  catalogue: "aster",
  identity: "aster/camera",
  artefacts: [exportArtefact],
};
const invocation: AsterCommandInvocationType = {
  command: "search",
  query: "camera",
  catalogue: "aster",
  tags: ["outline-icons"],
};

const diagnostic: AsterCommandDiagnosticType = {
  code: "ASTER-CLI-004",
  category: "not-found",
  message: "icon was not found",
};

const failure: AsterCommandResultType = {
  ok: false,
  command: "show",
  diagnostic,
};

declare const commands: AsterCommandSet;
const execution: Promise<AsterCommandResultType> = commands.execute(
  invocation,
  context,
);
const publicExecution: Promise<AsterCommandResultType> = AsterCommands.execute(
  invocation,
  context,
);
const publicProvider: CatalogueProvider = AsterCatalogue;
declare const commandPayload: AsterCommandPayloadType;
declare const iconResult: CatalogueIconResult;
declare const collectionResult: CatalogueCollectionResult;
declare const providerResult: CatalogueProviderResult;

// @ts-expect-error Unknown command identities are outside the accepted invocation union.
const unknownInvocation: AsterCommandInvocationType = { command: "remove" };

const invalidCollectionExport: AsterCommandInvocationType = {
  command: "export",
  subject: "collection",
  identity: "aster",
  // @ts-expect-error Collection export does not accept icon-specific accessibility options.
  options: { label: "Collection" },
};

// @ts-expect-error Collection listing cannot contain an explicit undefined provider filter.
const undefinedFilter: AsterCommandInvocationType = {
  command: "list",
  subject: "collections",
  catalogue: undefined,
};

// @ts-expect-error DOM ambient types are absent from the production command boundary.
const terminalElement: HTMLElement = descriptor;

void commandName;
void diagnosticCategory;
void diagnosticCode;
void execution;
void exportArtefact;
void exportInvocation;
void exportOptions;
void exportPlan;
void exportSubject;
void publicExecution;
void publicProvider;
void commandPayload;
void catalogueResultKind;
void iconResult;
void iconExportOptions;
void invalidCollectionExport;
void collectionResult;
void providerResult;
void failure;
void listSubject;
void payloadKind;
void provider;
void showSubject;
void terminalElement;
void undefinedFilter;
void unknownInvocation;
