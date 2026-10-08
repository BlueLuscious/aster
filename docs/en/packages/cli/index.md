# Aster CLI

Status: **Accepted**

`@luscious-garden/aster-cli` provides host-neutral commands and the standalone `aster`
executable. Programmatic hosts pass explicit providers and evidence to `AsterCommands`; the
private Node shell adapts argv and owns process and filesystem effects. `AsterCatalogue` is an
explicit built-in provider, not an ambient registry.

## Documentation

| Owner | Responsibility |
| --- | --- |
| [API](api/index.md) | Public composition, root exports and programmatic usage. |
| [Command](command/index.md) | Invocation, context, result, diagnostic and version-evidence contracts. |
| [Invocation](command/invocation/index.md) and [runtime](command/runtime/index.md) | Structured acceptance, dispatch and sanitised failures. |
| [Catalogue](catalogue/index.md) and [runtime](catalogue/runtime/index.md) | Metadata discovery, provider queries and exact definition resolution. |
| [Export](export/index.md) | Immutable SVG artefact planning. |
| [Review](review/index.md) | Technical plans and deterministic static HTML serialisation. |
| [Shell](shell/index.md) | Installation, executable grammar, output modes and exit statuses. |
| [Shell parsing](shell/parsing/index.md), [presentation](shell/presentation/index.md), [output](shell/output/index.md) and [version metadata](shell/version/index.md) | Private host composition and effects. |
| [Shared](shared/index.md) | Cross-feature identity, ordering and data-inspection authorities. |
| [Workflow](workflow.md) | Programmatic and standalone hand-offs. |
| [Compatibility](compatibility.md), [quality](quality.md) and [baseline](quality-baseline.md) | Supported ABI, conformance and measured evidence. |
| [Version history](releases/index.md) | Package changes and migrations. |

## Dependency boundary

CLI consumes public Core contracts and construction, Icons manifests and exact loaders, and public
SVG rendering. Metadata discovery does not evaluate complete Icons definitions; only Export and
Review request exact loaders. Importing the root does not evaluate Icons or execute the binary.

Production has no Import, framework, network, package-manager or repository-tooling authority.
Node services remain beneath the private shell; [compatibility](compatibility.md) owns the
runtime and declaration guarantees.
