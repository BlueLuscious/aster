import type { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";
import type { AsterCommandShowSubjectType } from "./aster-command-show-subject.type.js";

/**
 * @description Immutable supporting facts with explicit roles for each diagnostic family.
 * @remarks Definitions are concrete icons or collections, never glyph groups. Only a collection
 * selection can identify a failing member. Provider claim order and repetition are significant.
 */
export type AsterCommandDiagnosticDetailsType =
  | Readonly<{
      /** @description Received-provider claim discriminator. */
      kind: typeof commandDiagnosticSchema.details.catalogues;
      /** @description Complete ordered received provider identities, including repeated claims. */
      catalogues: readonly string[];
    }>
  | Readonly<{
      /** @description Provider-scoped metadata failure discriminator. */
      kind: typeof commandDiagnosticSchema.details.catalogue;
      /** @description Accepted identity of the provider responsible for the failure. */
      catalogue: string;
    }>
  | Readonly<{
      /** @description Exact lookup failure discriminator. */
      kind: typeof commandDiagnosticSchema.details.lookup;
      /** @description Explicit requested value family, independent of message wording. */
      subject:
        | AsterCommandShowSubjectType
        | typeof commandDiagnosticSchema.catalogueSubject;
      /** @description Complete requested textual identity without an inferred treatment or namespace. */
      identity: string;
    }>
  | Readonly<{
      /** @description Ambiguous exact selection discriminator. */
      kind: typeof commandDiagnosticSchema.details.ambiguity;
      /** @description Explicit requested metadata family. */
      subject: AsterCommandShowSubjectType;
      /** @description Complete requested textual identity shared by candidate providers. */
      identity: string;
      /** @description At least two distinct provider identities in canonical candidate order. */
      catalogues: readonly [string, string, ...string[]];
    }>
  | (Readonly<{
      /** @description Provider-scoped concrete definition failure discriminator. */
      kind: typeof commandDiagnosticSchema.details.definition;
      /** @description Accepted identity of the selected provider. */
      catalogue: string;
    }> &
      (
        | Readonly<{
            /** @description Selected concrete icon, which cannot carry a failing collection member. */
            selection: Readonly<{
              /** @description Concrete icon selection discriminator. */
              kind: typeof asterCommandSubjects.show.icon;
              /** @description Complete selected icon identity, including its treatment. */
              identity: string;
            }>;
            /** @description Member evidence is not applicable to an individual icon selection. */
            member?: never;
          }>
        | Readonly<{
            /** @description Selected concrete collection whose definition could not be accepted. */
            selection: Readonly<{
              /** @description Collection selection discriminator. */
              kind: typeof asterCommandSubjects.show.collection;
              /** @description Complete selected collection identity. */
              identity: string;
            }>;
            /** @description Known failing concrete member identity, absent for collection-wide failures. */
            member?: string;
          }>
      ))
  | Readonly<{
      /** @description SVG artefact rendering failure discriminator. */
      kind: typeof commandDiagnosticSchema.details.exportRender;
      /** @description Logical artefact path that could not be rendered. */
      path: string;
    }>
  | Readonly<{
      /** @description Technical review rendering failure discriminator. */
      kind: typeof commandDiagnosticSchema.details.reviewRender;
      /** @description Complete concrete icon identity that could not be rendered. */
      icon: string;
    }>
  | Readonly<{
      /** @description Conflicting logical artefact path discriminator. */
      kind: typeof commandDiagnosticSchema.details.pathConflict;
      /** @description Logical artefact path claimed by more than one selected definition. */
      path: string;
    }>;
