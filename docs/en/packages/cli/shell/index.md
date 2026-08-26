# CLI Shell

Status: **Experimental**

The shell feature is the private Node adapter over the public `AsterCommands` composition. It owns
argv tokenisation, the built-in executable context, presentation, optional output-tree
publication, stdout, stderr, and process exit status. It does not own command validation,
catalogue queries, portable values, or provider normalisation.

## Installation And Invocation

An installed package exposes the `aster` binary. It may be installed as a project development
dependency and invoked through the selected package manager:

```sh
pnpm add --save-dev @aster/cli
pnpm exec aster list catalogues
```

The initial grammar is:

```text
aster list catalogues
aster list collections [--catalogue <provider>]
aster list icons [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...
aster search <query> [--catalogue <provider>] [--collection <identity>] [--tag <tag>]...
aster show icon <identity> [--catalogue <provider>]
aster show collection <identity> [--catalogue <provider>]
aster export icon <identity> [--catalogue <provider>] [render-options] [--output <root>]
aster export collection <identity> [--catalogue <provider>] [render-options] --output <root>
aster export icon <identity> [--catalogue <provider>] [render-options] --json
aster export collection <identity> [--catalogue <provider>] [render-options] --json
aster help [export|list|search|show]
aster version
```

Export render options are `--size`, `--colour`, `--fill`, `--stroke`, `--stroke-width`, and
`--direction`. Icon export additionally accepts `--label` and `--title`. Numeric values use finite
decimal notation. Paint and direction domains, minimum size, and icon-owned presentation override
policies remain validated by the same host-neutral command and SVG boundaries as programmatic
invocation.

Invoking `aster` without arguments is equivalent to `aster help`. A query or accessible value
containing spaces must be supplied as one quoted shell argument. `--tag` may be repeated; every
export option and singleton filter may occur only once, and `--json` may not be repeated. Unknown,
empty, incomplete, or extra arguments are usage failures.

Icon export without `--json` or `--output` writes one raw SVG document. JSON mode exposes the
complete host-neutral plan for either subject. Collection export requires JSON or an output root.
`--json` and `--output` are mutually exclusive shell concerns and never enter
`AsterCommandInvocationType` together.

The shell explicitly supplies `AsterCatalogue`. This is executable composition rather than an
ambient default in `AsterCommands`.

## Presentation

Human output is plain deterministic text with no terminal-width or mandatory ANSI behaviour.
Successful human output is written to stdout. Expected human failures are written to stderr with
their stable diagnostic code and any related values.

Successful output publication writes only a committed destination and artefact-count summary. An
empty collection writes an explicit non-publication summary because no output root is created.
The shell never prints SVG markup or a headless plan after claiming that the same result was
published.

`--json` may occur once for any command. It is removed before structured invocation and therefore
never enters `AsterCommandInvocationType`. JSON mode writes exactly one compact command-result
document followed by one newline to stdout for both success and expected failure. It writes
nothing to stderr and contains no ANSI styling or human table formatting.

The initial result model contains no warning channel. The shell does not invent one outside the
host-neutral command result; a future warning presentation requires an accepted structured result
contract first.

## Exit Status

| Status | Meaning | Human stream | JSON stream |
| --- | --- | --- | --- |
| `0` | Command success. | stdout | stdout |
| `2` | Usage failure. | stderr | stdout |
| `1` | Lookup, catalogue, render, output, execution, or shell failure. | stderr | stdout where JSON mode applies. |

Presentation receives an immutable result and returns complete stream strings plus status before
the entrypoint performs any process write. Presentation therefore cannot mutate or alter command
behaviour.

## Runtime Composition

| Class | Responsibility |
| --- | --- |
| `CommandLineParser` | Separates shell presentation and adapts positional command forms. |
| `CommandLineOptionParser` | Parses closed command-specific singleton filters and repeated tags. |
| `ExportCommandLineParser` | Owns exact icon and collection export forms while keeping output outside the invocation. |
| `ExportCommandLineOptionParser` | Parses export-specific provider, render, accessibility, and output values. |
| `CommandOutputPresenter` | Selects human or JSON presentation, streams, and exit status. |
| `HumanOutputPresenter` | Renders plain help, discovery, raw single-icon SVG, export summaries, version, and failure text. |
| `JsonOutputPresenter` | Serialises one unstyled structured result document. |
| `ShellDiagnosticFactory` | Adapts parser, output-host, and unexpected shell faults into canonical command diagnostics. |
| `NodeShell` | Executes the host-neutral command before optionally publishing its complete export plan. |
| `ExportOutputPathResolver` | Resolves explicit output roots and rejects unsafe, ambiguous, escaping, or duplicate logical artefact paths. |
| `ExportOutputPublisher` | Stages a complete non-empty artefact tree beside an absent target and publishes it through one rename. |
| `NodeExportOutputFileSystem` | Implements the narrow private output authority with Node filesystem operations. |
| `ExportOutputError` | Carries sanitised output-conflict or output-failure evidence for shell diagnostic adaptation. |

The private `IExportOutputFileSystem` contract limits publication to existence checks, directory
creation, exclusive text creation, directory rename, and current-stage removal. Resolved
locations, staged entries, publication evidence, and error kinds remain internal shell types. No
filesystem contract or Node type enters the package root or host-neutral declaration graph.

The supplied current directory must be absolute, preventing path resolution from consulting
ambient process state. An empty export plan resolves its requested location but performs no
filesystem operation. A non-empty plan rejects an existing target or deterministic sibling stage
before creating anything. The publisher creates the complete stage, checks the target again, and
commits through one same-parent rename. A caught write or rename failure removes only a stage
created by that publication attempt; pre-existing and interrupted stages are preserved for
explicit recovery. Absent parent directories may be created before staging, so a caught failure
guarantees stage cleanup rather than removal of newly created empty ancestors. Native filesystem
messages are not part of the stable failure surface.

The executable entrypoint is the only module that imports `node:process`. Node path and filesystem
imports occur only in private output-host collaborators. The host-neutral compiler excludes the
complete shell tree. The referenced shell project consumes host-neutral declarations, admits Node
types, and emits only the private binary modules. Importing `@aster/cli` resolves only the
side-effect-free programmatic root and never evaluates the entrypoint.

The authoritative command and output semantics are defined by the
[Command-line Boundary](../../../architecture/command-line-boundary.md).
