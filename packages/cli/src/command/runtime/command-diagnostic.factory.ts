import { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type {
  AsterCommandDiagnosticDetailsType,
  AsterCommandDiagnosticType,
} from "../types/index.js";

/**
 * @description Constructs isolated immutable command diagnostics at runtime boundaries.
 */
export class CommandDiagnosticFactory {
  /**
   * @description Isolates one typed diagnostic from accepted producer-owned facts.
   * @remarks This is an internal construction boundary, not a public unknown-data parser. The
   * narrow return assertion preserves the input's code/category/detail correlation after copying;
   * each detail role is copied explicitly and all retained containers are frozen.
   * @param diagnostic - Correlated failure assembled from accepted facts by its owning producer.
   * @returns Isolated immutable command diagnostic.
   */
  create(diagnostic: AsterCommandDiagnosticType): AsterCommandDiagnosticType {
    const details =
      Object.hasOwn(diagnostic, "details") && diagnostic.details !== undefined
        ? this.#details(diagnostic.details)
        : undefined;

    return Object.freeze({
      category: diagnostic.category,
      code: diagnostic.code,
      message: diagnostic.message,
      ...(details === undefined ? {} : { details }),
    }) as AsterCommandDiagnosticType;
  }

  /**
   * @description Copies only the facts owned by one accepted diagnostic role.
   * @param details - Typed facts supplied by the responsible internal producer.
   * @returns Isolated deeply frozen facts with unchanged semantic roles and sequence order.
   */
  #details(
    details: AsterCommandDiagnosticDetailsType,
  ): AsterCommandDiagnosticDetailsType {
    switch (details.kind) {
      case commandDiagnosticSchema.details.catalogues:
        return Object.freeze({
          kind: details.kind,
          catalogues: Object.freeze([...details.catalogues]),
        });
      case commandDiagnosticSchema.details.catalogue:
        return Object.freeze({
          kind: details.kind,
          catalogue: details.catalogue,
        });
      case commandDiagnosticSchema.details.lookup:
        return Object.freeze({
          kind: details.kind,
          subject: details.subject,
          identity: details.identity,
        });
      case commandDiagnosticSchema.details.ambiguity:
        if (
          !details.catalogues.some(
            (catalogue) => catalogue !== details.catalogues[0],
          )
        ) {
          throw new TypeError(
            "Ambiguous selection requires distinct catalogue providers",
          );
        }
        return Object.freeze({
          kind: details.kind,
          subject: details.subject,
          identity: details.identity,
          catalogues: Object.freeze([...details.catalogues] as const),
        });
      case commandDiagnosticSchema.details.definition:
        if (details.selection.kind === asterCommandSubjects.show.icon) {
          return Object.freeze({
            kind: details.kind,
            catalogue: details.catalogue,
            selection: Object.freeze({
              kind: details.selection.kind,
              identity: details.selection.identity,
            }),
          });
        }
        return Object.freeze({
          kind: details.kind,
          catalogue: details.catalogue,
          selection: Object.freeze({
            kind: details.selection.kind,
            identity: details.selection.identity,
          }),
          ...(Object.hasOwn(details, "member") && details.member !== undefined
            ? { member: details.member }
            : {}),
        });
      case commandDiagnosticSchema.details.exportRender:
      case commandDiagnosticSchema.details.pathConflict:
        return Object.freeze({ kind: details.kind, path: details.path });
      case commandDiagnosticSchema.details.reviewRender:
        return Object.freeze({ kind: details.kind, icon: details.icon });
    }
  }
}
