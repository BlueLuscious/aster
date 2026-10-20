import { asterCommandDescriptors } from "../constants/aster-command-descriptors.constant.js";
import { asterCommandNames } from "../constants/aster-command-names.constant.js";
import { asterCommandPayloadKinds } from "../constants/aster-command-payload-kinds.constant.js";
import { asterInstalledPackageNames } from "../constants/aster-installed-package-names.constant.js";
import { asterPackageVersionSources } from "../constants/aster-package-version-sources.constant.js";
import { asterVersionScopes } from "../constants/aster-version-scopes.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { ICommandDefinition } from "../contracts/internal/command-definition.contract.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type { AsterInstalledPackageVersion } from "../contracts/aster-installed-package-version.contract.js";
import type { AsterPackageDependencyGroup } from "../contracts/aster-package-dependency-group.contract.js";
import { CommandDiagnosticFactory } from "../runtime/command-diagnostic.factory.js";
import { CommandResultFactory } from "../runtime/command-result.factory.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../types/index.js";

/**
 * @description Canonical public package order derived from the single name authority.
 */
const packageNames = Object.freeze(Object.values(asterInstalledPackageNames));

/**
 * @description Returns explicit host-supplied product, installed package, or dependency metadata.
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
   * @description Returns the selected version view without loading catalogues.
   * @param invocation - Canonical version invocation.
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

    const scopeValue = Object.hasOwn(invocation, "scope") ? invocation.scope : undefined;
    const dependenciesValue = Object.hasOwn(invocation, "dependencies") ? invocation.dependencies : undefined;
    const locationValue = Object.hasOwn(invocation, "location") ? invocation.location : undefined;

    const cliLocation = Object.hasOwn(context, "cliLocation") ? context.cliLocation : undefined;

    if (locationValue === true && cliLocation === undefined) {
      return this.#invalid("version location requires executed-CLI evidence");
    }

    const location = locationValue === true ? cliLocation : undefined;

    if (dependenciesValue === true) {
      const cli = scopeValue === undefined || scopeValue === "cli";
      const source = cli ? asterPackageVersionSources.cli : asterPackageVersionSources.project;
      const evidence = Object.hasOwn(context, "packageDependencies") ? context.packageDependencies : undefined;

      if (evidence?.source !== source || !this.#matchesGroups(invocation, evidence.groups, context)) {
        return this.#invalid(`version request requires complete ${source} dependency evidence`);
      }

      return this.#results.success(asterCommandNames.version, Object.freeze({
        kind: asterCommandPayloadKinds.packageDependencies,
        source,
        groups: this.#orderGroups(evidence.groups),
        ...(location === undefined ? {} : { location }),
      }));
    }

    if (scopeValue === undefined) {
      return this.#results.success(asterCommandNames.version, Object.freeze({
        kind: asterCommandPayloadKinds.version,
        productName: context.productName,
        productVersion: context.productVersion,
        ...(location === undefined ? {} : { location }),
      }));
    }

    if (scopeValue === "cli") {
      return this.#results.success(asterCommandNames.version, Object.freeze({
        kind: asterCommandPayloadKinds.packageVersions,
        source: asterPackageVersionSources.cli,
        packages: Object.freeze([Object.freeze({
          name: asterInstalledPackageNames.cli,
          version: context.productVersion,
        })]),
        ...(location === undefined ? {} : { location }),
      }));
    }

    const evidence = Object.hasOwn(context, "packageVersions") ? context.packageVersions : undefined;
    const aggregate = scopeValue === asterVersionScopes.all;
    const expectedName = aggregate ? undefined : asterInstalledPackageNames[scopeValue];
    const packages = evidence?.packages.filter((entry) =>
      expectedName === undefined || entry.name === expectedName
    );

    if (
      evidence?.source !== asterPackageVersionSources.project
      || packages === undefined
      || (expectedName !== undefined && packages.length !== 1)
    ) {
      return this.#invalid("version request requires complete project package evidence");
    }

    return this.#results.success(asterCommandNames.version, Object.freeze({
      kind: asterCommandPayloadKinds.packageVersions,
      source: asterPackageVersionSources.project,
      ...(aggregate ? { aggregate: true } : {}),
      packages: this.#orderPackages(packages),
    }));
  }

  /**
   * @description Checks that selected roots agree with the request and their source.
   * @param invocation - Canonical dependency invocation.
   * @param groups - Accepted host-owned dependency groups.
   * @param context - Accepted product metadata for the executed CLI.
   * @returns Whether the supplied roots can satisfy this request without substitution.
   */
  #matchesGroups(
    invocation: Extract<AsterCommandInvocationType, { command: typeof asterCommandNames.version }>,
    groups: readonly AsterPackageDependencyGroup[],
    context: AsterCommandContext,
  ): boolean {
    const scopeValue = Object.hasOwn(invocation, "scope") ? invocation.scope : undefined;

    if (scopeValue === undefined || scopeValue === "cli") {
      return groups.length === 1
        && groups[0]?.root.name === asterInstalledPackageNames.cli
        && groups[0].root.version === context.productVersion;
    }

    if (scopeValue === asterVersionScopes.all) {
      return true;
    }

    return groups.length === 1
      && groups[0]?.root.name === asterInstalledPackageNames[scopeValue];
  }

  /**
   * @description Orders installed records by the canonical public package authority.
   * @param packages - Accepted installed package records.
   * @returns Frozen canonically ordered records.
   */
  #orderPackages(packages: readonly AsterInstalledPackageVersion[]): readonly AsterInstalledPackageVersion[] {
    return Object.freeze([...packages].sort((left, right) =>
      packageNames.findIndex((name) => name === left.name)
        - packageNames.findIndex((name) => name === right.name)
    ));
  }

  /**
   * @description Orders roots and dependency lists without flattening distinct installations.
   * @param groups - Accepted installed root groups.
   * @returns Frozen groups and dependency lists in canonical public order.
   */
  #orderGroups(groups: readonly AsterPackageDependencyGroup[]): readonly AsterPackageDependencyGroup[] {
    return Object.freeze([...groups]
      .sort((left, right) =>
        packageNames.findIndex((name) => name === left.root.name)
          - packageNames.findIndex((name) => name === right.root.name)
      )
      .map(({ root, dependencies }) => Object.freeze({
        root,
        dependencies: this.#orderPackages(dependencies),
      })));
  }

  /**
   * @description Creates a stable invalid-context result for missing or mismatched host evidence.
   * @param message - Safe explanation of the expected evidence.
   * @returns Immutable invalid-context command result.
   */
  #invalid(message: string): AsterCommandResultType {
    return this.#results.failure(
      asterCommandNames.version,
      this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.invalidContext,
        message,
      ),
    );
  }
}
