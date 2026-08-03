import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type {
  AsterCommandInvocationType,
  AsterCommandNameType,
} from "../types/index.js";
import type { TAcceptanceResult } from "../types/internal/acceptance-result.type.js";
import { CommandDiagnosticFactory } from "./command-diagnostic.factory.js";

/**
 * @description Validates, canonicalises, isolates, and freezes structured command invocations.
 */
export class CommandInvocationNormaliser {
  /**
   * @description Canonical ASCII slug grammar shared by CLI identity components and tags.
   */
  readonly #slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /**
   * @description Immutable diagnostic constructor used for rejected invocations.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Validates and isolates one untrusted structured invocation.
   * @param value - Candidate invocation supplied by a shell or programmatic host.
   * @returns Accepted canonical invocation or structured usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#isRecord(value) || typeof value.command !== "string") {
      return this.#invalid("expected invocation.command to identify a command");
    }

    switch (value.command) {
      case asterCommandNames.list:
        return this.#normaliseList(value);
      case asterCommandNames.search:
        return this.#normaliseSearch(value);
      case asterCommandNames.show:
        return this.#normaliseShow(value);
      case asterCommandNames.help:
        return this.#normaliseHelp(value);
      case asterCommandNames.version:
        return this.#normaliseVersion(value);
      default:
        return this.#invalid(`unknown command ${JSON.stringify(value.command)}`);
    }
  }

  /**
   * @description Accepts one list invocation and its subject-specific filters.
   * @param value - Candidate list record.
   * @returns Accepted immutable list invocation or usage rejection.
   */
  #normaliseList(
    value: Record<string, unknown>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#hasOnlyFields(value, [
      "command",
      "subject",
      "catalogue",
      "collection",
      "tags",
    ])) {
      return this.#invalid("list invocation contains an unknown field");
    }

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
    value: Record<string, unknown>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#hasOnlyFields(value, [
      "command",
      "query",
      "catalogue",
      "collection",
      "tags",
    ])) {
      return this.#invalid("search invocation contains an unknown field");
    }

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
    value: Record<string, unknown>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#hasOnlyFields(value, [
      "command",
      "subject",
      "identity",
      "catalogue",
    ])) {
      return this.#invalid("show invocation contains an unknown field");
    }

    if (
      value.subject !== asterCommandSubjects.show.icon &&
      value.subject !== asterCommandSubjects.show.collection
    ) {
      return this.#invalid("expected show subject to be icon or collection");
    }

    if (
      !this.#isCanonicalIdentity(
        value.identity,
        value.subject === asterCommandSubjects.show.icon,
      )
    ) {
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
        identity: value.identity,
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
    value: Record<string, unknown>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#hasOnlyFields(value, ["command", "commandName"])) {
      return this.#invalid("help invocation contains an unknown field");
    }

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
    value: Record<string, unknown>,
  ): TAcceptanceResult<AsterCommandInvocationType> {
    if (!this.#hasOnlyFields(value, ["command"])) {
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
   * @description Determines whether a candidate is a non-null string-keyed record.
   * @param value - Candidate value.
   * @returns Whether own fields can be inspected safely.
   */
  #isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /**
   * @description Determines whether a record contains no fields outside a closed set.
   * @param value - Record to inspect.
   * @param fields - Accepted own-field names.
   * @returns Whether every own field is accepted.
   */
  #hasOnlyFields(
    value: Record<string, unknown>,
    fields: readonly string[],
  ): boolean {
    return Object.keys(value).every((field) => fields.includes(field));
  }

  /**
   * @description Determines whether one optional field is a canonical provider identity.
   * @param value - Record containing the optional field.
   * @param field - Own field to inspect when present.
   * @returns Whether the absent or present value is valid.
   */
  #hasCanonicalOptionalProvider(
    value: Record<string, unknown>,
    field: string,
  ): boolean {
    return !Object.hasOwn(value, field) || this.#isSlug(value[field]);
  }

  /**
   * @description Determines whether one optional field is a canonical portable textual identity.
   * @param value - Record containing the optional field.
   * @param field - Own field to inspect when present.
   * @param allowVariant - Whether an `@variant` component is accepted.
   * @returns Whether the absent or present identity is valid.
   */
  #hasCanonicalOptionalIdentity(
    value: Record<string, unknown>,
    field: string,
    allowVariant: boolean,
  ): boolean {
    return (
      !Object.hasOwn(value, field) ||
      this.#isCanonicalIdentity(value[field], allowVariant)
    );
  }

  /**
   * @description Determines whether optional tags are canonical and unique.
   * @param value - Invocation record containing optional tags.
   * @returns Whether absent or present tags satisfy the accepted boundary.
   */
  #hasCanonicalOptionalTags(value: Record<string, unknown>): boolean {
    if (!Object.hasOwn(value, "tags")) {
      return true;
    }

    if (!Array.isArray(value.tags) || value.tags.length === 0) {
      return false;
    }

    const tags = value.tags;
    return tags.every((tag) => this.#isSlug(tag)) && new Set(tags).size === tags.length;
  }

  /**
   * @description Determines whether a value is a canonical portable textual identity.
   * @param value - Candidate textual identity.
   * @param allowVariant - Whether an `@variant` component is accepted.
   * @returns Whether every identity component is a canonical slug.
   */
  #isCanonicalIdentity(value: unknown, allowVariant: boolean): value is string {
    if (typeof value !== "string") {
      return false;
    }

    const variantSections = value.split("@");

    if (variantSections.length > (allowVariant ? 2 : 1)) {
      return false;
    }

    const identity = variantSections[0];
    const variant = variantSections[1];

    if (identity === undefined || (variant !== undefined && !this.#isSlug(variant))) {
      return false;
    }

    const identitySections = identity.split("/");
    return (
      identitySections.length <= 2 &&
      identitySections.every((section) => this.#isSlug(section))
    );
  }

  /**
   * @description Determines whether a candidate is a canonical ASCII lowercase kebab-case slug.
   * @param value - Candidate slug.
   * @returns Whether the slug matches the shared CLI grammar.
   */
  #isSlug(value: unknown): value is string {
    return typeof value === "string" && this.#slugPattern.test(value);
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
