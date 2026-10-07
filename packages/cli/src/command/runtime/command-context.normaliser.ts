import type {
  CollectionDefinition,
  CollectionIdentity,
  IconDefinition,
  IconIdentity,
} from "@luscious-garden/aster-core";
import type {
  CatalogueDiscovery,
  CatalogueProvider,
} from "../../catalogue/contracts/index.js";
import { CanonicalIdentityValidator } from "../../shared/runtime/canonical-identity.validator.js";
import { StructuredDataInspector } from "../../shared/runtime/structured-data.inspector.js";
import { asterInstalledPackageNames } from "../constants/aster-installed-package-names.constant.js";
import { asterCliLocationStatuses } from "../constants/aster-cli-location-statuses.constant.js";
import { asterPackageVersionSources } from "../constants/aster-package-version-sources.constant.js";
import { commandDiagnosticSchema } from "../constants/command-diagnostic-schema.constant.js";
import type { AsterCommandContext } from "../contracts/index.js";
import type { AsterInstalledPackageVersion } from "../contracts/aster-installed-package-version.contract.js";
import type { AsterPackageVersionEvidence } from "../contracts/aster-package-version-evidence.contract.js";
import type { AsterPackageDependencyEvidence } from "../contracts/aster-package-dependency-evidence.contract.js";
import type { AsterPackageDependencyGroup } from "../contracts/aster-package-dependency-group.contract.js";
import type { AsterCliLocationEvidence } from "../contracts/aster-cli-location-evidence.contract.js";
import type { AsterCliLocationStatusType } from "../types/aster-cli-location-status.type.js";
import type { TAcceptanceResult } from "../types/internal/acceptance-result.type.js";
import { CommandDiagnosticFactory } from "./command-diagnostic.factory.js";

/**
 * @description Accepts and isolates the complete explicit capability context for one execution.
 */
export class CommandContextNormaliser {
  /**
   * @description Canonical ASCII provider-identity grammar.
   */
  readonly #identities = new CanonicalIdentityValidator();

  /**
   * @description Exact context-record and provider-sequence acceptance authority.
   */
  readonly #data = new StructuredDataInspector();

  /**
   * @description Immutable diagnostic constructor used for rejected contexts.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Validates and isolates one untrusted command context.
   * @param value - Candidate explicit capability context.
   * @returns Accepted immutable context or structured rejection evidence.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandContext> {
    const record = this.#data.record(value, [
      "catalogues",
      "productName",
      "productVersion",
      "packageVersions",
      "packageDependencies",
      "cliLocation",
    ], ["catalogues", "productName", "productVersion"]);

    if (record === undefined) {
      return this.#invalid("expected product metadata, catalogues, and optional version evidence only");
    }

    const providerValues = this.#data.array(record.catalogues);

    if (providerValues === undefined) {
      return this.#invalid("expected context.catalogues to be an array");
    }

    if (!this.#isNonEmptyString(record.productName)) {
      return this.#invalid("expected context.productName to be a non-empty string");
    }

    if (!this.#isNonEmptyString(record.productVersion)) {
      return this.#invalid("expected context.productVersion to be a non-empty string");
    }

    const packageVersions = record.packageVersions === undefined
      ? undefined
      : this.#acceptPackageVersions(record.packageVersions);

    if (Object.hasOwn(record, "packageVersions") && packageVersions === undefined) {
      return this.#invalid("expected context.packageVersions to contain a source and unique public package versions");
    }

    const packageDependencies = record.packageDependencies === undefined
      ? undefined
      : this.#acceptPackageDependencies(record.packageDependencies);

    if (Object.hasOwn(record, "packageDependencies") && packageDependencies === undefined) {
      return this.#invalid("expected context.packageDependencies to contain valid root groups");
    }

    const cliLocation = record.cliLocation === undefined
      ? undefined
      : this.#acceptCliLocation(record.cliLocation);

    if (Object.hasOwn(record, "cliLocation") && cliLocation === undefined) {
      return this.#invalid("expected context.cliLocation to identify the executed CLI");
    }

    const catalogues: CatalogueProvider[] = [];

    for (const providerValue of providerValues) {
      const provider = this.#acceptProvider(providerValue);

      if (provider === undefined) {
        return this.#invalid(
          "expected each catalogue provider to expose canonical discovery and definition loaders",
        );
      }

      catalogues.push(provider);
    }

    const identities = catalogues.map((provider) => provider.identity);

    if (new Set(identities).size !== identities.length) {
      return Object.freeze({
        accepted: false,
        diagnostic: this.#diagnostics.create(
          commandDiagnosticSchema.categories.catalogueConflict,
          commandDiagnosticSchema.codes.catalogueConflict,
          "catalogue provider identities must be unique",
          identities,
        ),
      });
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        catalogues: Object.freeze([...catalogues]),
        productName: record.productName,
        productVersion: record.productVersion,
        ...(packageVersions === undefined ? {} : { packageVersions }),
        ...(packageDependencies === undefined ? {} : { packageDependencies }),
        ...(cliLocation === undefined ? {} : { cliLocation }),
      }),
    });
  }

  /**
   * @description Creates a structured invalid-context rejection.
   * @param message - Deterministic explanation of the violated context contract.
   * @returns Immutable rejected acceptance result.
   */
  #invalid(message: string): TAcceptanceResult<AsterCommandContext> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.invalidContext,
        message,
      ),
    });
  }

  /**
   * @description Determines whether a candidate is a non-empty string without edge whitespace.
   * @param value - Candidate value.
   * @returns Whether the value is already canonical for product metadata.
   */
  #isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0 && value.trim() === value;
  }

  /**
   * @description Copies source-tagged package evidence without trusting host-owned containers.
   * @param value - Candidate provenance and installed package manifests.
   * @returns Frozen canonical evidence or no value after rejection.
   */
  #acceptPackageVersions(value: unknown): AsterPackageVersionEvidence | undefined {
    const record = this.#data.record(value, ["source", "packages"], ["source", "packages"]);
    const source = record?.source;
    const entries = this.#data.array(record?.packages);

    if (
      (source !== asterPackageVersionSources.project && source !== asterPackageVersionSources.cli)
      || (source === asterPackageVersionSources.cli && entries?.length === 0)
      || entries === undefined
      || entries.length > Object.keys(asterInstalledPackageNames).length
    ) {
      return undefined;
    }

    const accepted: AsterInstalledPackageVersion[] = [];
    const names = new Set<string>();

    for (const entry of entries) {
      const acceptedEntry = this.#acceptInstalledVersion(entry);

      if (acceptedEntry === undefined || names.has(acceptedEntry.name)) {
        return undefined;
      }

      names.add(acceptedEntry.name);
      accepted.push(acceptedEntry);
    }

    return Object.freeze({ source, packages: Object.freeze(accepted) });
  }

  /**
   * @description Accepts one installed public package record without trusting its container.
   * @param value - Candidate installed package record.
   * @returns Frozen canonical record or no value after rejection.
   */
  #acceptInstalledVersion(value: unknown): AsterInstalledPackageVersion | undefined {
    const record = this.#data.record(value, ["name", "version"], ["name", "version"]);

    if (
      record === undefined
      || typeof record.name !== "string"
      || !Object.values(asterInstalledPackageNames).some((name) => name === record.name)
      || !this.#isNonEmptyString(record.version)
    ) {
      return undefined;
    }

    return Object.freeze({ name: record.name, version: record.version });
  }

  /**
   * @description Accepts independent installed root and dependency groups.
   * @param value - Candidate source-tagged group evidence.
   * @returns Frozen group evidence or no value after rejection.
   */
  #acceptPackageDependencies(value: unknown): AsterPackageDependencyEvidence | undefined {
    const record = this.#data.record(value, ["source", "groups"], ["source", "groups"]);
    const source = record?.source;
    const groups = this.#data.array(record?.groups);

    if (
      (source !== asterPackageVersionSources.project && source !== asterPackageVersionSources.cli)
      || groups === undefined
      || groups.length > Object.keys(asterInstalledPackageNames).length
      || (source === asterPackageVersionSources.cli && groups.length !== 1)
    ) {
      return undefined;
    }

    const accepted: AsterPackageDependencyGroup[] = [];
    const roots = new Set<string>();

    for (const group of groups) {
      const candidate = this.#data.record(group, ["root", "dependencies"], ["root", "dependencies"]);
      const root = this.#acceptInstalledVersion(candidate?.root);
      const dependencies = this.#data.array(candidate?.dependencies);

      if (
        root === undefined
        || dependencies === undefined
        || dependencies.length > Object.keys(asterInstalledPackageNames).length - 1
        || roots.has(root.name)
      ) {
        return undefined;
      }

      const names = new Set<string>([root.name]);
      const acceptedDependencies: AsterInstalledPackageVersion[] = [];

      for (const dependency of dependencies) {
        const entry = this.#acceptInstalledVersion(dependency);

        if (entry === undefined || names.has(entry.name)) {
          return undefined;
        }

        names.add(entry.name);
        acceptedDependencies.push(entry);
      }

      roots.add(root.name);
      accepted.push(Object.freeze({ root, dependencies: Object.freeze(acceptedDependencies) }));
    }

    return Object.freeze({ source, groups: Object.freeze(accepted) });
  }

  /**
   * @description Accepts opt-in executable path and project comparison without exposing host APIs.
   * @param value - Candidate executed-CLI location evidence.
   * @returns Frozen location evidence or no value after rejection.
   */
  #acceptCliLocation(value: unknown): AsterCliLocationEvidence | undefined {
    const record = this.#data.record(value, ["entrypoint", "projectCli"], ["entrypoint", "projectCli"]);
    const projectCli = record?.projectCli;

    if (
      record === undefined
      || !this.#isNonEmptyString(record.entrypoint)
      || !this.#isCliLocationStatus(projectCli)
    ) {
      return undefined;
    }

    return Object.freeze({
      entrypoint: record.entrypoint,
      projectCli,
    });
  }

  /**
   * @description Narrows one value to the closed project-CLI comparison vocabulary.
   * @param value - Candidate comparison status.
   * @returns Whether the status belongs to the canonical runtime vocabulary.
   */
  #isCliLocationStatus(value: unknown): value is AsterCliLocationStatusType {
    return Object.values(asterCliLocationStatuses).some((status) => status === value);
  }

  /**
   * @description Determines whether a candidate satisfies the narrow catalogue-provider shape.
   * @param value - Candidate provider.
   * @returns Whether the provider can be accepted without invoking it.
   */
  #acceptProvider(value: unknown): CatalogueProvider | undefined {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return undefined;
    }

    const identityMember = this.#dataMember(value, "identity");
    const discoverMember = this.#dataMember(value, "discover");
    const loadIconMember = this.#dataMember(value, "loadIcon");
    const loadCollectionMember = this.#dataMember(value, "loadCollection");

    if (
      identityMember === undefined
      || discoverMember === undefined
      || loadIconMember === undefined
      || loadCollectionMember === undefined
      || !this.#identities.slug(identityMember.value)
      || typeof discoverMember.value !== "function"
      || typeof loadIconMember.value !== "function"
      || typeof loadCollectionMember.value !== "function"
    ) {
      return undefined;
    }

    const identity = identityMember.value;
    const discover = discoverMember.value;
    const loadIcon = loadIconMember.value;
    const loadCollection = loadCollectionMember.value;

    return Object.freeze({
      identity,

      /**
       * @description Invokes snapshotted discovery with its original receiver.
       * @returns Provider-owned discovery candidate for strict downstream acceptance.
       */
      async discover(): Promise<CatalogueDiscovery> {
        return Reflect.apply(discover, value, []) as Promise<CatalogueDiscovery>;
      },

      /**
       * @description Invokes the snapshotted exact icon loader with its original receiver.
       * @param selectedIdentity - Complete selected icon identity.
       * @returns Provider-owned definition candidate or no value.
       */
      async loadIcon(
        selectedIdentity: IconIdentity,
      ): Promise<IconDefinition | undefined> {
        return Reflect.apply(loadIcon, value, [selectedIdentity]) as Promise<
          IconDefinition | undefined
        >;
      },

      /**
       * @description Invokes the snapshotted exact collection loader with its original receiver.
       * @param selectedIdentity - Complete selected collection identity.
       * @returns Provider-owned definition candidate or no value.
       */
      async loadCollection(
        selectedIdentity: CollectionIdentity,
      ): Promise<CollectionDefinition | undefined> {
        return Reflect.apply(loadCollection, value, [selectedIdentity]) as Promise<
          CollectionDefinition | undefined
        >;
      },
    });
  }

  /**
   * @description Resolves one data-valued capability member without executing accessors.
   * @param value - Capability object or class instance.
   * @param key - Public contract member to resolve.
   * @returns Snapshotted member value or no value after absence or accessor rejection.
   */
  #dataMember(
    value: object,
    key: string,
  ): Readonly<{
    /** @description Safely resolved public data-member value. */
    value: unknown;
  }> | undefined {
    let owner: object | null = value;
    const visited = new Set<object>();

    while (owner !== null) {
      if (visited.has(owner)) {
        return undefined;
      }

      visited.add(owner);
      const descriptor = Object.getOwnPropertyDescriptor(owner, key);

      if (descriptor !== undefined) {
        return "value" in descriptor
          ? Object.freeze({ value: descriptor.value })
          : undefined;
      }

      owner = Object.getPrototypeOf(owner) as object | null;
    }

    return undefined;
  }
}
