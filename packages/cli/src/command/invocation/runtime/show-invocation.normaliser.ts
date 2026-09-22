import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import { asterCommandSubjects } from "../../constants/aster-command-subjects.constant.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { CanonicalIdentityValidator } from "../../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";
import { InvocationFilterNormaliser } from "./invocation-filter.normaliser.js";

/**
 * @description Accepts the exact structured show invocation family.
 */
export class ShowInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.show;

  /**
   * @description Exact record acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical provider and portable identity validator.
   */
  readonly #identities = new CanonicalIdentityValidator();

  /**
   * @description Shared optional invocation-filter acceptance authority.
   */
  readonly #filters = new InvocationFilterNormaliser();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Accepts one exact icon or collection lookup.
   * @param value - Candidate show invocation.
   * @returns Accepted immutable show invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(
      value,
      ["command", "subject", "identity", "catalogue"],
      ["command", "subject", "identity"],
    );

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid("show invocation contains an unknown field");
    }

    if (
      record.subject !== asterCommandSubjects.show.icon
      && record.subject !== asterCommandSubjects.show.collection
    ) {
      return this.#rejections.invalid(
        "expected show subject to be icon or collection",
      );
    }

    const validIdentity = record.subject === asterCommandSubjects.show.icon
      ? this.#identities.icon(record.identity)
      : this.#identities.collection(record.identity);

    if (!validIdentity) {
      return this.#rejections.invalid(
        `expected a canonical ${record.subject} identity`,
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

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: this.command,
        subject: record.subject,
        identity: record.identity as string,
        ...(Object.hasOwn(record, "catalogue")
          ? { catalogue: record.catalogue as string }
          : {}),
      }),
    });
  }
}
