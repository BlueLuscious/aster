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
   * @description Accepts plain, scoped, dependency, and opt-in location requests.
   * @param value - Candidate version invocation.
   * @returns Accepted immutable version invocation or usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType> {
    const record = this.#data.record(value, ["command", "scope", "dependencies", "location"], ["command"]);

    if (record === undefined || record.command !== this.command) {
      return this.#rejections.invalid(
        "version invocation accepts only command, scope, dependencies, and location",
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

    if (Object.hasOwn(record, "dependencies") && record.dependencies !== true) {
      return this.#rejections.invalid("version dependencies must be true when supplied");
    }

    if (Object.hasOwn(record, "location")) {
      if (record.location !== true || (scope !== undefined && scope !== "cli")) {
        return this.#rejections.invalid("version location requires the executed CLI");
      }
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        command: this.command,
        ...(scope === undefined ? {} : { scope }),
        ...(record.dependencies === true ? { dependencies: true } : {}),
        ...(record.location === true ? { location: true } : {}),
      }),
    });
  }
}
