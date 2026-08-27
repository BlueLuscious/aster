import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { InvocationFilterNormaliser } from "./invocation-filter.normaliser.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Accepts the exact structured search invocation family.
 */
export class SearchInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.search;

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
   * @description Accepts one search query and its optional exact filters.
   * @param value - Candidate search invocation.
   * @returns Accepted immutable search invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(
      value,
      ["command", "query", "catalogue", "collection", "tags"],
      ["command", "query"],
    );

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid("search invocation contains an unknown field");
    }

    if (typeof record.query !== "string" || record.query.trim().length === 0) {
      return this.#rejections.invalid(
        "expected search query to be a non-empty string",
      );
    }

    if (
      Object.hasOwn(record, "catalogue")
      && !this.#filters.provider(record, "catalogue")
    ) {
      return this.#rejections.invalid(
        "expected catalogue filter to be a canonical provider identity",
      );
    }

    if (
      Object.hasOwn(record, "collection")
      && !this.#filters.collection(record, "collection")
    ) {
      return this.#rejections.invalid(
        "expected collection filter to be a canonical collection identity",
      );
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
        query: record.query.trim().toLowerCase(),
        ...(Object.hasOwn(record, "catalogue")
          ? { catalogue: record.catalogue as string }
          : {}),
        ...(Object.hasOwn(record, "collection")
          ? { collection: record.collection as string }
          : {}),
        ...(tags === undefined ? {} : { tags }),
      }),
    });
  }

}
