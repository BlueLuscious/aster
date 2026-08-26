# CLI Quality

Status: **Experimental Audit Baseline**

This document inventories the current observable `@aster/cli` boundary, its existing conformance
evidence, and the pressures that require resolution before the package can claim a hardened
pre-release contract. The implemented execution path is documented by the
[CLI Workflow](workflow.md).

## Public inventory

The package exposes only the root subpath and publishes four immutable runtime values:

- `AsterCommands`, the host-neutral command composition;
- `AsterCatalogue`, the explicit built-in catalogue provider;
- `catalogueResultKinds`, the catalogue-result discriminator authority;
- `exportTargets`, the export-target discriminator authority.

Its public type surface comprises:

- `AsterCommandSet`, `AsterCommandDescriptor`, and `AsterCommandContext`;
- `AsterCommandNameType`, `AsterCommandListSubjectType`, `AsterCommandShowSubjectType`,
  `AsterCommandInvocationType`, `AsterCommandPayloadKindType`, `AsterCommandPayloadType`, and
  `AsterCommandResultType`;
- `AsterCommandDiagnosticType`, `AsterCommandDiagnosticCodeType`, and
  `AsterCommandDiagnosticCategoryType`;
- `CatalogueProvider`, `CatalogueSnapshot`, `CatalogueIconRecord`, and
  `CatalogueCollectionRecord`;
- `CatalogueProviderResult`, `CatalogueIconResult`, and `CatalogueCollectionResult`;
- `CatalogueResultKindType`;
- `AsterExportArtefact`, `AsterExportPlan`, `AsterExportSubjectType`, `AsterExportOptionsType`, and
  `AsterIconExportOptionsType`.

Command definitions, normalisers, queries, factories, provider implementations, shell services,
errors, internal contracts, and internal types are emitted modules but are not resolvable through
the package export map. The executable module is reachable only through the package `bin` mapping.

## Runtime inventory

| Feature | Current responsibility | Host authority |
| --- | --- | --- |
| Public composition | Constructs one immutable command set from explicit definitions and services. | None |
| Command | Accepts structured invocations and contexts, dispatches six commands, and returns immutable results. | None |
| Catalogue | Loads explicit providers, isolates portable definitions, and performs deterministic discovery. | None |
| Export | Selects exact catalogue definitions and produces complete immutable SVG artefact plans. | None |
| Built-in provider | Dynamically acquires canonical `@aster/icons` definitions when explicitly loaded. | Package loading only |
| Shell | Parses argv, presents output, maps process status, and composes output publication. | Node process and filesystem |

`help` and `version` do not load catalogue providers. Importing the package root constructs
stateless command services and the built-in provider wrapper but does not evaluate `@aster/icons`,
read process state, access the filesystem, or write output.

## Dependency ownership

| Dependency | Exact responsibility |
| --- | --- |
| `@aster/core` | Portable definition contracts, reconstruction, identity, metadata, presentation, and render-option vocabulary used by catalogue and export boundaries. |
| `@aster/icons` | Canonical definitions supplied only by the explicit built-in provider through a dynamic import. |
| `@aster/svg` | Public deterministic SVG rendering used to create export artefacts. |

Build, DOM, browser, framework, network, package-manager, Flora, and repository-tooling imports are
absent from production source. Node imports occur only in the private shell entrypoint, output-path
resolver, and filesystem adapter. The host-neutral TypeScript project excludes the complete shell
tree and admits neither Node nor DOM ambient types.

## Observable workflows

| Workflow | Acquisition | Host-neutral result | Standalone effect |
| --- | --- | --- | --- |
| Root import | ESM root | Four runtime exports | None |
| `help` | Structured invocation or argv | Frozen descriptor payload | Human or JSON output |
| `version` | Structured invocation and product metadata | Frozen version payload | Human or JSON output |
| `list`, `search`, `show` | Explicit catalogue providers | Frozen discovery payload | Human or JSON output |
| Icon export | Exact icon selection and render options | One immutable SVG artefact plan | Human, JSON, raw SVG, or output-root publication |
| Collection export | Exact collection selection and complete membership resolution | Canonically ordered immutable SVG artefact plan | Human, JSON, or output-root publication |

The standalone shell uses the same structured command result as an independent programmatic host.
Filesystem publication begins only after a complete successful plan exists. It stages an absent
tree beside the requested destination and performs one final rename without silently replacing an
existing target.

## Existing conformance

The current evidence comprises compile-time public-shape checks, 25 host-neutral runtime tests,
32 package-ABI and executable tests, architecture policy, documentation verification, and complete
repository workflows. It currently demonstrates:

- exact immutable root values and rejected implementation subpaths;
- silent root import and lazy built-in catalogue loading;
- explicit provider injection and deterministic provider-order independence;
- structured invocation, context, descriptor, result, diagnostic, and payload behaviour;
- catalogue discovery, empty values, many-to-many membership, ambiguity, conflicts, and failures;
- complete icon and collection export planning without partial artefacts;
- equivalent standalone and independent programmatic results;
- human, JSON, and raw SVG presentation with deterministic streams and statuses;
- output-path rejection, exclusive staging, absent-target publication, and current-stage cleanup;
- clean consumption using only copied publishable package files.

Subprocess-based executable and clean-consumer evidence requires an environment that permits child
Node processes. A blocked subprocess reports no process status and is not a CLI result.

## Distribution snapshot

The current build emits native ES2022 ESM. The unminified distribution contains:

- 79 host-neutral JavaScript modules totalling 109,881 bytes;
- 28 private shell JavaScript modules totalling 52,089 bytes;
- 79 host-neutral declaration files totalling 61,371 bytes;
- 186 distribution files totalling 223,341 bytes.

The package dry-run contains 189 entries including the manifest, README, and licence. Its observed
archive size is 42,975 bytes and its unpacked size is 226,565 bytes. These values are comparison
evidence from the current toolchain, not compatibility promises or performance thresholds.

The shell project intentionally emits no declarations, but currently emits empty JavaScript
modules for type-only shell files. Distribution granularity and executable startup remain future
measurement concerns rather than reasons to add bundling or alter source organisation during the
inventory.

## Audit pressures

| Pressure | Current evidence | Required boundary |
| --- | --- | --- |
| Public ABI | Four runtime values and 26 public contracts or types are exported, but hardening has not classified each against an independent consumer. | Retain, narrow, or document each value in the package and dependency audit without exposing implementation subpaths. |
| Runtime declaration | Canonical docs claim the repository Node range for the executable, while the package manifest has no package-local `engines` field. | Publish one explicit executable runtime contract in the package manifest. |
| README completeness | The package README lists discovery commands but omits the implemented export workflow. | Synchronise it with the retained public and executable surface. |
| Reflective input acceptance | Current record checks rely on `Object.keys`, direct property reads, and broad non-array object acceptance. | Decide exact prototype, symbol, descriptor, accessor, sparse-array, Proxy, and caller-failure semantics before claiming hostile-input hardening. |
| Provider retention | Context normalisation freezes the provider sequence but retains provider objects and their callable methods by reference. | Define whether provider identity and loading capability require snapshots, structural isolation, or explicit trusted capability semantics. |
| Repeated authorities | Canonical slug checks and ASCII comparison appear in multiple command, catalogue, and export responsibilities. | Centralise only semantics proven identical across features, without leaking Core or shell ownership. |
| Command growth | Invocation normalisation, argv parsing, and human presentation contain command-family switches. | Keep explicit dispatch but prevent future commands from extending unrelated unbounded coordinators. |
| Catalogue concentration | Record and snapshot normalisers are sizeable complete data boundaries. | Split only if adversarial evidence proves independently changing responsibilities; method count alone is insufficient. |
| Filesystem races | Lexical path validation, exclusive writes, staging, and rename are covered, while symlink and concurrent-host semantics need an explicit guarantee or non-guarantee. | Preserve destination confinement and stage ownership without claiming an operating-system transaction the host cannot provide. |
| Startup and package cost | Current subprocess timings include Node startup and temporary-consumer preparation; distribution emits one module per source file. | Measure cold import, command execution, provider loading, export, presentation, and packaging independently before optimisation. |
| External documentation | Some project documents still describe CLI export as future pressure or rely on legacy architecture and governance roots. | Synchronise consumers during hardening and complete authority migration in documentation hardening. |

No pressure currently authorises mutable caches, global registries, automatic discovery,
inheritance hierarchies, trusted-definition shortcuts, bundling, or API growth.

## Baseline scenario boundary

The future CLI performance baseline should measure cold root import, `help`, `version`, catalogue
discovery, one icon export, complete collection export, JSON presentation, and host-neutral output
planning independently. Package-manager startup, dependency installation, temporary-consumer
copying, filesystem publication, and test-runner bootstrap must not be included accidentally in
command-domain timing.

Any candidate comparison must preserve exact structured results, diagnostics, ordering, SVG bytes,
streams, statuses, path semantics, lazy provider loading, and package ABI. Performance reports
remain informative local evidence rather than CI thresholds.
