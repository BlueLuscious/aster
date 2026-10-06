import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import { asterInstalledPackageNames } from "../constants/aster-installed-package-names.constant.js";
import { asterVersionScopes } from "../constants/aster-version-scopes.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import { CommandDiagnosticFactory } from "../runtime/command-diagnostic.factory.js";
import { CommandResultFactory } from "../runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Returns explicit host-supplied product metadata without loading catalogues.
 */
export class VersionCommandDefinition implements ICommandDefinition {
  /**
   * @description Immutable version identity and accepted usage metadata.
   */
  readonly descriptor = asterCommandDescriptors.version;

  /**
   * @description Structured command outcome constructor.
   */
  readonly #results = new CommandResultFactory();

  /**
   * @description Stable diagnostics for absent or mismatched explicit host evidence.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Returns plain product metadata or selected installed package evidence.
   * @param invocation - Canonical plain or scoped version invocation.
   * @param context - Accepted explicit product and optional package metadata.
   * @returns Immutable structured version outcome.
   */
  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    if (invocation.command !== asterCommandNames.version) {
      throw new TypeError("Invalid version command invocation");
    }

    if (invocation.scope !== undefined) {
      const expectedNames = invocation.scope === asterVersionScopes.all
        ? Object.values(asterInstalledPackageNames)
        : [asterInstalledPackageNames[invocation.scope]];
      const packages = expectedNames.map((name) =>
        context.packageVersions?.find((entry) => entry.name === name)
      );

      if (packages.some((entry) => entry === undefined)) {
        return this.#results.failure(
          asterCommandNames.version,
          this.#diagnostics.create(
            commandDiagnosticSchema.categories.usage,
            commandDiagnosticSchema.codes.invalidContext,
            "version request requires explicit installed package evidence",
          ),
        );
      }

      return this.#results.success(asterCommandNames.version, Object.freeze({
        kind: asterCommandPayloadKinds.packageVersions,
        packages: Object.freeze(packages.filter((entry) => entry !== undefined)),
      }));
    }

    return this.#results.success(asterCommandNames.version, Object.freeze({
      kind: asterCommandPayloadKinds.version,
      productName: context.productName,
      productVersion: context.productVersion,
    }));
  }
}
