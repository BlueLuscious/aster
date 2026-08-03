import type {
  AsterCommandContext,
  AsterCommandDescriptor,
  AsterCommandDiagnosticCategoryType,
  AsterCommandDiagnosticCodeType,
  AsterCommandDiagnosticType,
  AsterCommandInvocationType,
  AsterCommandListSubjectType,
  AsterCommandNameType,
  AsterCommandResultType,
  AsterCommandSet,
  AsterCommandShowSubjectType,
  CatalogueProvider,
  CatalogueSnapshot,
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

// @ts-expect-error Unknown command identities are outside the accepted invocation union.
const unknownInvocation: AsterCommandInvocationType = { command: "remove" };

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
void failure;
void listSubject;
void provider;
void showSubject;
void terminalElement;
void undefinedFilter;
void unknownInvocation;
