import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type {
  AsterCommandInvocationType,
  AsterCommandNameType,
} from "../types/index.js";
import type { TAcceptanceResult } from "../types/internal/acceptance-result.type.js";
import { CommandDiagnosticFactory } from "./command-diagnostic.factory.js";
import { ExportOptionsNormaliser } from "../../export/runtime/export-options.normaliser.js";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";

/**
 * @description Validates, canonicalises, isolates, and freezes structured command invocations.
 */
export class CommandInvocationNormaliser {
  /**
   * @description Canonical provider and portable textual identity validator.
   */
  readonly #identities = new CanonicalIdentityValidator();

  /**
   * @description Exact record and dense-array acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Immutable diagnostic constructor used for rejected invocations.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Command-local portable export-option acceptance boundary.
   */
  readonly #exportOptions = new ExportOptionsNormaliser();

  /**
   * @description Validates and isolates one untrusted structured invocation.
   * @param value - Candidate invocation supplied by a shell or programmatic host.
   * @returns Accepted canonical invocation or structured usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, [
      "command",
      "subject",
      "identity",
      "catalogue",
      "options",
      "collection",
      "tags",
      "query",
      "commandName",
    ], ["command"]);

    if (record === undefined || typeof record.command !== "string") {
      return this.#invalid("expected invocation.command to identify a command");
    }

    switch (record.command) {
      case asterCommandNames.export:
        return this.#normaliseExport(record);
      case asterCommandNames.list:
        return this.#normaliseList(record);
      case asterCommandNames.search:
        return this.#normaliseSearch(record);
      case asterCommandNames.show:
        return this.#normaliseShow(record);
      case asterCommandNames.help:
        return this.#normaliseHelp(record);
      case asterCommandNames.version:
        return this.#normaliseVersion(record);
      default:
        return this.#invalid(`unknown command ${JSON.stringify(record.command)}`);
    }
  }

  /**
   * @description Accepts one exact icon or collection export invocation.
   * @param value - Candidate export record.
   * @returns Accepted immutable export invocation or usage rejection.
   */
  #normaliseExport(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, [
      "command",
      "subject",
      "identity",
      "catalogue",
      "options",
    ]);

    if (record === undefined) {
      return this.#invalid("export invocation contains an unknown field");
    }

    value = record;

    if (
      value.subject !== asterCommandSubjects.export.icon &&
      value.subject !== asterCommandSubjects.export.collection
    ) {
      return this.#invalid("expected export subject to be icon or collection");
    }

    const validIdentity = value.subject === asterCommandSubjects.export.icon
      ? this.#identities.icon(value.identity)
      : this.#identities.collection(value.identity);

    if (!validIdentity) {
      return this.#invalid(`expected a canonical ${value.subject} identity`);
    }

    if (!this.#hasCanonicalOptionalProvider(value, "catalogue")) {
      return this.#invalid("expected catalogue filter to be a canonical provider identity");
    }

    const options = this.#exportOptions.normalise(
      value.options,
      Object.hasOwn(value, "options"),
      value.subject === asterCommandSubjects.export.icon,
    );

    if (!options.accepted) {
      return options;
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: asterCommandNames.export,
        subject: value.subject,
        identity: value.identity as string,
        ...(Object.hasOwn(value, "catalogue")
          ? { catalogue: value.catalogue as string }
          : {}),
        ...(options.value === undefined ? {} : { options: options.value }),
      }) as AsterCommandInvocationType,
    });
  }

  /**
   * @description Accepts one list invocation and its subject-specific filters.
   * @param value - Candidate list record.
   * @returns Accepted immutable list invocation or usage rejection.
   */
  #normaliseList(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, [
      "command",
      "subject",
      "catalogue",
      "collection",
      "tags",
    ]);

    if (record === undefined) {
      return this.#invalid("list invocation contains an unknown field");
    }

    value = record;

    if (
      value.subject !== asterCommandSubjects.list.catalogues &&
      value.subject !== asterCommandSubjects.list.collections &&
      value.subject !== asterCommandSubjects.list.icons
    ) {
      return this.#invalid("expected list subject to be catalogues, collections, or icons");
    }

    if (
      value.subject === asterCommandSubjects.list.catalogues &&
      Object.keys(value).length !== 2
    ) {
      return this.#invalid("catalogue listing does not accept filters");
    }

    if (
      value.subject === asterCommandSubjects.list.collections &&
      (Object.hasOwn(value, "collection") || Object.hasOwn(value, "tags"))
    ) {
      return this.#invalid("collection listing accepts only a catalogue filter");
    }

    if (!this.#hasCanonicalOptionalProvider(value, "catalogue")) {
      return this.#invalid("expected catalogue filter to be a canonical provider identity");
    }

    if (!this.#hasCanonicalOptionalIdentity(value, "collection", false)) {
      return this.#invalid("expected collection filter to be a canonical collection identity");
    }

    if (!this.#hasCanonicalOptionalTags(value)) {
      return this.#invalid("expected tags to contain unique canonical values");
    }

    const tags = Object.hasOwn(value, "tags")
      ? Object.freeze([...(value.tags as readonly string[])])
      : undefined;

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: asterCommandNames.list,
        subject: value.subject,
        ...(Object.hasOwn(value, "catalogue")
          ? { catalogue: value.catalogue as string }
          : {}),
        ...(Object.hasOwn(value, "collection")
          ? { collection: value.collection as string }
          : {}),
        ...(tags === undefined ? {} : { tags }),
      }),
    });
  }

  /**
   * @description Accepts one search invocation and canonical optional filters.
   * @param value - Candidate search record.
   * @returns Accepted immutable search invocation or usage rejection.
   */
  #normaliseSearch(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, [
      "command",
      "query",
      "catalogue",
      "collection",
      "tags",
    ]);

    if (record === undefined) {
      return this.#invalid("search invocation contains an unknown field");
    }

    value = record;

    if (typeof value.query !== "string" || value.query.trim().length === 0) {
      return this.#invalid("expected search query to be a non-empty string");
    }

    if (!this.#hasCanonicalOptionalProvider(value, "catalogue")) {
      return this.#invalid("expected catalogue filter to be a canonical provider identity");
    }

    if (!this.#hasCanonicalOptionalIdentity(value, "collection", false)) {
      return this.#invalid("expected collection filter to be a canonical collection identity");
    }

    if (!this.#hasCanonicalOptionalTags(value)) {
      return this.#invalid("expected tags to contain unique canonical values");
    }

    const tags = Object.hasOwn(value, "tags")
      ? Object.freeze([...(value.tags as readonly string[])])
      : undefined;

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: asterCommandNames.search,
        query: value.query.trim().toLowerCase(),
        ...(Object.hasOwn(value, "catalogue")
          ? { catalogue: value.catalogue as string }
          : {}),
        ...(Object.hasOwn(value, "collection")
          ? { collection: value.collection as string }
          : {}),
        ...(tags === undefined ? {} : { tags }),
      }),
    });
  }

  /**
   * @description Accepts one exact icon or collection lookup invocation.
   * @param value - Candidate show record.
   * @returns Accepted immutable show invocation or usage rejection.
   */
  #normaliseShow(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, [
      "command",
      "subject",
      "identity",
      "catalogue",
    ]);

    if (record === undefined) {
      return this.#invalid("show invocation contains an unknown field");
    }

    value = record;

    if (
      value.subject !== asterCommandSubjects.show.icon &&
      value.subject !== asterCommandSubjects.show.collection
    ) {
      return this.#invalid("expected show subject to be icon or collection");
    }

    const validIdentity = value.subject === asterCommandSubjects.show.icon
      ? this.#identities.icon(value.identity)
      : this.#identities.collection(value.identity);

    if (!validIdentity) {
      return this.#invalid(`expected a canonical ${value.subject} identity`);
    }

    if (!this.#hasCanonicalOptionalProvider(value, "catalogue")) {
      return this.#invalid("expected catalogue filter to be a canonical provider identity");
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: asterCommandNames.show,
        subject: value.subject,
        identity: value.identity as string,
        ...(Object.hasOwn(value, "catalogue")
          ? { catalogue: value.catalogue as string }
          : {}),
      }),
    });
  }

  /**
   * @description Accepts deterministic help metadata selection.
   * @param value - Candidate help record.
   * @returns Accepted immutable help invocation or usage rejection.
   */
  #normaliseHelp(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, ["command", "commandName"]);

    if (record === undefined) {
      return this.#invalid("help invocation contains an unknown field");
    }

    value = record;

    if (
      Object.hasOwn(value, "commandName") &&
      !this.#isCommandName(value.commandName)
    ) {
      return this.#invalid("expected help commandName to identify an accepted command");
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: asterCommandNames.help,
        ...(Object.hasOwn(value, "commandName")
          ? { commandName: value.commandName as AsterCommandNameType }
          : {}),
      }),
    });
  }

  /**
   * @description Accepts the fieldless version invocation.
   * @param value - Candidate version record.
   * @returns Accepted immutable version invocation or usage rejection.
   */
  #normaliseVersion(
    value: Readonly<Record<string, unknown>>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (this.#data.record(value, ["command"]) === undefined) {
      return this.#invalid("version invocation does not accept additional fields");
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({ command: asterCommandNames.version }),
    });
  }

  /**
   * @description Creates one immutable structured usage rejection.
   * @param message - Deterministic explanation of the malformed invocation.
   * @returns Rejected invocation acceptance result.
   */
  #invalid(message: string): TAcceptanceResult<AsterCommandInvocationType> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.usage,
        message,
      ),
    });
  }

  /**
   * @description Determines whether one optional field is a canonical provider identity.
   * @param value - Record containing the optional field.
   * @param field - Own field to inspect when present.
   * @returns Whether the absent or present value is valid.
   */
  #hasCanonicalOptionalProvider(
    value: Readonly<Record<string, unknown>>,
    field: string,
  ): boolean {
    return !Object.hasOwn(value, field) || this.#identities.slug(value[field]);
  }

  /**
   * @description Determines whether one optional field is a canonical portable textual identity.
   * @param value - Record containing the optional field.
   * @param field - Own field to inspect when present.
   * @param allowVariant - Whether an `@variant` component is accepted.
   * @returns Whether the absent or present identity is valid.
   */
  #hasCanonicalOptionalIdentity(
    value: Readonly<Record<string, unknown>>,
    field: string,
    allowVariant: boolean,
  ): boolean {
    return (
      !Object.hasOwn(value, field) ||
      (allowVariant
        ? this.#identities.icon(value[field])
        : this.#identities.collection(value[field]))
    );
  }

  /**
   * @description Determines whether optional tags are canonical and unique.
   * @param value - Invocation record containing optional tags.
   * @returns Whether absent or present tags satisfy the accepted boundary.
   */
  #hasCanonicalOptionalTags(value: Readonly<Record<string, unknown>>): boolean {
    if (!Object.hasOwn(value, "tags")) {
      return true;
    }

    const tags = this.#data.array(value.tags);

    if (tags === undefined || tags.length === 0) {
      return false;
    }

    return (
      tags.every((tag) => this.#identities.slug(tag))
      && new Set(tags).size === tags.length
    );
  }

  /**
   * @description Determines whether a candidate identifies one accepted command.
   * @param value - Candidate command identity.
   * @returns Whether the identity belongs to the closed initial command family.
   */
  #isCommandName(value: unknown): value is AsterCommandNameType {
    return (
      typeof value === "string" &&
      (Object.values(asterCommandNames) as readonly string[]).includes(value)
    );
  }
}
