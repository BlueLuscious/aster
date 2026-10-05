# CLI Shell

Status: **Pre-release**

The shell feature is the private Node adapter over the public `AsterCommands` composition. It owns
argv tokenisation, the built-in executable context, presentation, optional output-tree
publication, stdout, stderr, and process exit status. It does not own command validation,
catalogue queries, portable values, or provider normalisation.

## Installation And Invocation

An installed package exposes the `aster` binary. It may be installed as a project development
dependency and invoked through the selected package manager:

```sh
pnpm add --save-dev @luscious-garden/aster-cli
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
aster review icon <identity> [--catalogue <provider>] [--output <root>] [--replace]
aster review collection <identity> [--catalogue <provider>] [--output <root>] [--replace]
aster help [export|help|list|review|search|show|version]
aster version
aster version <core|icons|svg|cli> [--json]
aster version --all [--json]
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

Plain `aster version` reports the installed CLI version alone. Named version requests read only
the selected public package manifest; `--all` reads Core, Icons, SVG, and CLI in that order.
Both forms report installed versions resolved from the CLI executable, not the caller's working
directory or the latest versions on a registry. The private Import package is not reported.
Malformed installed metadata causes one failure without partial output. The
[Version Metadata](version/index.md) feature owns manifest acquisition.

Review returns a headless technical plan. JSON presents that plan without effects. Human execution
serialises and publishes static HTML beneath `aster-review` or an explicit `--output` root.
`--replace` permits replacement only when the destination carries unchanged Aster review ownership
evidence. Output roots and replacement intent remain outside the structured invocation.

The shell explicitly supplies `AsterCatalogue`. This is executable composition rather than an
ambient default in `AsterCommands`. Discovery commands acquire only Icons manifests. Export and
Review acquire only the exact selected definition after host-neutral metadata selection; shell
presentation and publication never inspect or enumerate definition modules.

## Presentation

Human output is plain deterministic text with no terminal-width or mandatory ANSI behaviour.
Successful human output is written to stdout. Expected human failures are written to stderr with
their stable diagnostic code and any related values.

Successful export publication writes only a committed destination and artefact-count summary. An
empty exported collection writes an explicit non-publication summary because no output root is
created. Successful review publication reports whether it created or replaced its destination.
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

The shell is divided into [Parsing](parsing/index.md), [Presentation](presentation/index.md),
[Output](output/index.md), and private [Version Metadata](version/index.md) subfeatures.
`NodeShell` coordinates the active command and output boundaries without moving host authority
into the programmatic command API.

| Class | Responsibility |
| --- | --- |
| `CommandLineParser` | Dispatches argv adaptation to explicit command-owned parsers. |
| `CommandOutputPresenter` | Selects human or JSON presentation, streams, and exit status. |
| `ShellDiagnosticFactory` | Adapts parser, output-host, and unexpected shell faults into canonical command diagnostics. |
| `NodeShell` | Acquires requested installed versions or executes the host-neutral command before optionally publishing a complete export or review plan. |

The executable entrypoint is the only module that imports `node:process` or uses the CommonJS
manifest bridge. Node path and output-filesystem imports occur in private [Output](output/index.md);
the private [Version Metadata](version/index.md) reader owns installed package resolution and
manifest reads. The host-neutral compiler excludes the complete shell tree. The referenced shell
project consumes host-neutral declarations, admits Node types, and emits only private binary
modules. Importing `@luscious-garden/aster-cli` resolves only the side-effect-free programmatic
root and never evaluates the entrypoint.

Host-neutral command semantics remain authoritative in [CLI Command](../command/index.md),
[CLI Export](../export/index.md), and [CLI Review](../review/index.md). [CLI Workflow](../workflow.md)
defines how this private adapter composes them without transferring Node authority into the public
root.
