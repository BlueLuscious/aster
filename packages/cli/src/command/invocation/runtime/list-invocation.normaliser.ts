import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../../constants/aster-command-subjects.constant.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { InvocationFilterNormaliser } from "./invocation-filter.normaliser.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Accepts the exact structured list invocation family.
 */
export class ListInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.list;

  /**
   * @description Exact record and dense-array acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical provider, collection, and tag validator.
   */
  readonly #filters = new InvocationFilterNormaliser();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Accepts provider, collection, glyph or icon listing with subject-specific filters.
   * @param value - Candidate list invocation.
   * @returns Accepted immutable list invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(
      value,
      ["command", "subject", "catalogue", "collection", "tags", "glyph"],
      ["command", "subject"],
    );

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid("list invocation contains an unknown field");
    }

    if (
      record.subject !== asterCommandSubjects.list.catalogues
      && record.subject !== asterCommandSubjects.list.collections
      && record.subject !== asterCommandSubjects.list.icons
      && record.subject !== asterCommandSubjects.list.glyphs
    ) {
      return this.#rejections.invalid(
        "expected list subject to be catalogues, collections, glyphs, or icons",
      );
    }

    if (
      record.subject === asterCommandSubjects.list.catalogues
      && Reflect.ownKeys(record).length !== 2
    ) {
      return this.#rejections.invalid("catalogue listing does not accept filters");
    }

    if (
      (record.subject === asterCommandSubjects.list.collections || record.subject === asterCommandSubjects.list.glyphs)
      && (Object.hasOwn(record, "collection") || Object.hasOwn(record, "tags") || Object.hasOwn(record, "glyph"))
    ) {
      return this.#rejections.invalid(
        `${record.subject === asterCommandSubjects.list.glyphs ? "glyph" : "collection"} listing accepts only a catalogue filter`,
      );
    }

    if (!this.#filters.provider(record, "catalogue")) {
      return this.#rejections.invalid(
        "expected catalogue filter to be a canonical provider identity",
      );
    }

    if (!this.#filters.collection(record, "collection")) {
      return this.#rejections.invalid(
        "expected collection filter to be a canonical collection identity",
      );
    }

    if (!this.#filters.glyph(record, "glyph")) {
      return this.#rejections.invalid("expected glyph filter to be a canonical glyph identity without a variant");
    }

    const tags = this.#filters.tags(record);

    if (tags === null) {
      return this.#rejections.invalid(
        "expected tags to contain unique canonical values",
      );
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: this.command,
        subject: record.subject,
        ...(Object.hasOwn(record, "catalogue")
          ? { catalogue: record.catalogue as string }
          : {}),
        ...(Object.hasOwn(record, "collection")
          ? { collection: record.collection as string }
          : {}),
        ...(tags === undefined ? {} : { tags }),
        ...(Object.hasOwn(record, "glyph") ? { glyph: record.glyph as string } : {}),
      }),
    });
  }

}
