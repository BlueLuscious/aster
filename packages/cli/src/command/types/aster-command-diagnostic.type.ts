import type { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { AsterCommandDiagnosticDetailsType } from "./aster-command-diagnostic-details.type.js";

/**
 * @description Immutable failure whose stable code determines its category and supporting details.
 * @remarks Supporting facts retain explicit semantic roles. Families without accepted context do
 * not carry details; expected provider failures never expose native exceptions.
 */
export type AsterCommandDiagnosticType = Readonly<{
  /** @description Concise deterministic explanation without native exception text. */
  message: string;
}> &
  (
    | Readonly<{
        /** @description Usage or invalid-context identifier. */
        code:
          | typeof commandDiagnosticSchema.codes.usage
          | typeof commandDiagnosticSchema.codes.invalidContext;
        /** @description Usage category shared by invocation and context rejections. */
        category: typeof commandDiagnosticSchema.categories.usage;
        /** @description No supporting facts are admitted for usage/context failures. */
        details?: never;
      }>
    | Readonly<{
        /** @description Conflicting provider ownership identifier. */
        code: typeof commandDiagnosticSchema.codes.catalogueConflict;
        /** @description Conflicting provider ownership category. */
        category: typeof commandDiagnosticSchema.categories.catalogueConflict;
        /** @description Complete received provider claims or the responsible discovery provider. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Allowed conflict evidence roles. */
            kind:
              | typeof commandDiagnosticSchema.details.catalogues
              | typeof commandDiagnosticSchema.details.catalogue;
          }
        >;
      }>
    | Readonly<{
        /** @description Exact lookup failure identifier. */
        code: typeof commandDiagnosticSchema.codes.notFound;
        /** @description Exact lookup failure category. */
        category: typeof commandDiagnosticSchema.categories.notFound;
        /** @description Explicit subject and identity requested by the lookup. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Required lookup evidence role. */
            kind: typeof commandDiagnosticSchema.details.lookup;
          }
        >;
      }>
    | Readonly<{
        /** @description Ambiguous provider selection identifier. */
        code: typeof commandDiagnosticSchema.codes.ambiguous;
        /** @description Ambiguous provider selection category. */
        category: typeof commandDiagnosticSchema.categories.ambiguous;
        /** @description Requested subject and distinct candidate providers. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Required ambiguity evidence role. */
            kind: typeof commandDiagnosticSchema.details.ambiguity;
          }
        >;
      }>
    | Readonly<{
        /** @description Unavailable or invalid catalogue identifier. */
        code: typeof commandDiagnosticSchema.codes.catalogueUnavailable;
        /** @description Unavailable or invalid catalogue category. */
        category: typeof commandDiagnosticSchema.categories.catalogueUnavailable;
        /** @description Responsible provider or exact definition selection with known member evidence. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Allowed provider and definition failure roles. */
            kind:
              | typeof commandDiagnosticSchema.details.catalogue
              | typeof commandDiagnosticSchema.details.definition;
          }
        >;
      }>
    | Readonly<{
        /** @description Contained rendering failure identifier. */
        code: typeof commandDiagnosticSchema.codes.renderFailure;
        /** @description Contained rendering failure category. */
        category: typeof commandDiagnosticSchema.categories.renderFailure;
        /** @description Export artefact path or concrete review icon, never an unlabelled string. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Allowed render evidence roles. */
            kind:
              | typeof commandDiagnosticSchema.details.exportRender
              | typeof commandDiagnosticSchema.details.reviewRender;
          }
        >;
      }>
    | Readonly<{
        /** @description Conflicting logical artefact path identifier. */
        code: typeof commandDiagnosticSchema.codes.exportConflict;
        /** @description Conflicting logical artefact path category. */
        category: typeof commandDiagnosticSchema.categories.exportConflict;
        /** @description Conflicting path known to the export planner. */
        details: Extract<
          AsterCommandDiagnosticDetailsType,
          {
            /** @description Required artefact conflict evidence role. */
            kind: typeof commandDiagnosticSchema.details.pathConflict;
          }
        >;
      }>
    | Readonly<{
        /** @description Existing output destination conflict identifier. */
        code: typeof commandDiagnosticSchema.codes.outputConflict;
        /** @description Existing output destination conflict category. */
        category: typeof commandDiagnosticSchema.categories.outputConflict;
        /** @description No additional output-host facts are admitted. */
        details?: never;
      }>
    | Readonly<{
        /** @description Output publication operation failure identifier. */
        code: typeof commandDiagnosticSchema.codes.outputFailure;
        /** @description Output publication operation failure category. */
        category: typeof commandDiagnosticSchema.categories.outputFailure;
        /** @description No native filesystem evidence is admitted. */
        details?: never;
      }>
    | Readonly<{
        /** @description Installed-version acquisition failure identifier. */
        code: typeof commandDiagnosticSchema.codes.versionUnavailable;
        /** @description Installed-version acquisition failure category. */
        category: typeof commandDiagnosticSchema.categories.versionUnavailable;
        /** @description No additional version-host facts are admitted. */
        details?: never;
      }>
    | Readonly<{
        /** @description Sanitised unexpected execution failure identifier. */
        code: typeof commandDiagnosticSchema.codes.executionFailure;
        /** @description Sanitised unexpected execution failure category. */
        category: typeof commandDiagnosticSchema.categories.executionFailure;
        /** @description Unexpected native exception evidence is never exposed. */
        details?: never;
      }>
  );
