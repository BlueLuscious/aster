import { asterCommandNames } from "../../constants/aster-command-names.constant.js";
import { asterVersionScopes } from "../../constants/aster-version-scopes.constant.js";
import type { AsterVersionScopeType } from "../../types/aster-version-scope.type.js";
import type { ICommandInvocationNormaliser } from "../contracts/internal/command-invocation-normaliser.contract.js";
import type { AsterCommandInvocationType } from "../../types/index.js";
import type { TAcceptanceResult } from "../../types/internal/acceptance-result.type.js";
import { StructuredDataInspector } from "../../../shared/runtime/structured-data.inspector.js";
import { isAsterInstalledPackageSelector } from "../../runtime/is-aster-installed-package-selector.js";
import { InvocationRejectionFactory } from "./invocation-rejection.factory.js";

/**
 * @description Accepts the exact structured version invocation family.
 */
export class VersionInvocationNormaliser implements ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command = asterCommandNames.version;

  /**
   * @description Exact record acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Canonical usage rejection constructor.
   */
  readonly #rejections = new InvocationRejectionFactory();

  /**
   * @description Accepts plain or explicitly scoped version invocations.
   * @param value - Candidate version invocation.
   * @returns Accepted immutable version invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, ["command", "scope"], ["command"]);

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid(
        "version invocation accepts only command and optional scope",
      );
    }

    let scope: AsterVersionScopeType | undefined;

    if (Object.hasOwn(record, "scope")) {
      const candidate = record.scope;

      if (candidate !== asterVersionScopes.all && !isAsterInstalledPackageSelector(candidate)) {
        return this.#rejections.invalid("version scope must identify a public Aster package or all");
      }

      scope = candidate;
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: this.command,
        ...(scope === undefined ? {} : { scope }),
      }),
    });
  }
}
