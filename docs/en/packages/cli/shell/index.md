# CLI Shell

Status: **Accepted**

The shell feature is the private Node adapter over the public `AsterCommands` composition. It owns
argv tokenisation, the built-in executable context, presentation, optional output-tree
publication, stdout, stderr, and process exit status. It does not own command validation,
catalogue queries, portable values, or provider normalisation.

## Installation and invocation

An installed package exposes the `aster` binary. It may be installed as a project development
dependency and invoked through the selected package manager:

```sh
pnpm add --save-dev @luscious-garden/aster-cli
pnpm exec aster list catalogues
```

A project-only installation does not normally add `node_modules/.bin` to an ordinary PowerShell
session's `PATH`. Use the package manager's execution command, a package script, or the explicit
local binary path to run it without a global installation. Bare `aster` works only when the shell
can already resolve that command. If the local binary is missing, `pnpm exec aster` may instead
find another `aster` on `PATH`. `aster version --location` reports which CLI module ran; it does
not select one. Package scripts can invoke a locally installed binary through the package
manager's script `PATH` without making it globally available.

## Command grammar

The implemented grammar is:

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
aster version [--deps] [--location] [--json]
aster version cli [--deps] [--location] [--json]
aster version <core|icons|svg> [--deps] [--json]
aster version --all [--deps] [--json]
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

## Version queries

Plain `aster version` reports the CLI that actually ran; `version cli` names that same CLI.
Named Core, Icons and SVG requests read directly installed packages of the current project.
`--all` lists the project's directly installed public Aster packages, including a project CLI
only if installed there. It can therefore differ from `version cli`. The private Import package
is not reported. None reports the latest registry version. A named request emits one
`@luscious-garden/aster-<package> <version>` line; `--all` has a `Project Aster packages:`
heading. JSON uses `command: "version"` and source-tagged `package-versions` evidence:

```json
{"ok":true,"command":"version","payload":{"kind":"package-versions","source":"project","packages":[{"name":"@luscious-garden/aster-core","version":"0.1.0"}]}}
```

The version is illustrative. `version --json` retains its separate `version` payload with
`productName` and `productVersion`. `--deps` groups each selected root separately from only its
direct installed Aster runtime dependencies. It does not include the root in its own dependency
list, development, peer or optional dependencies, or the transitive closure. Bare `version --deps`
and `version cli --deps` are equivalent; `version --all --deps` groups all direct project roots.
Core has no Aster runtime dependencies, and an empty project has no groups. Human output keeps
the roots separate; JSON uses one shape for single and multiple roots:

```json
{"ok":true,"command":"version","payload":{"kind":"package-dependencies","source":"project","groups":[{"root":{"name":"@luscious-garden/aster-icons","version":"0.1.0"},"dependencies":[{"name":"@luscious-garden/aster-core","version":"0.1.0"}]}]}}
```

An aggregate human result keeps separate roots rather than flattening their dependencies:

```text
Project Aster package dependencies:
@luscious-garden/aster-core 0.1.0
  (no Aster dependencies)

@luscious-garden/aster-icons 0.1.0
  @luscious-garden/aster-core 0.1.0
```

For example, these commands inspect different installations when an external CLI runs inside a
project with its own Icons package:

```sh
pnpm exec aster version icons --deps
pnpm exec aster version --all --deps --json
pnpm exec aster version cli --deps --location
```

The first uses the project's direct Icons installation and its own Core dependency; the second
groups every direct project Aster package; the third uses the executed CLI and its dependencies.
The JSON `source` identifies where each root was selected, not where every dependency appears in
the project. A project-local CLI appears in `--all --deps` only when directly installed, even if
another CLI executable handled the command.

`--location` is available only for the executed CLI forms, optionally with `--deps`. It adds the
loaded module's absolute path, not the PowerShell or package-manager shim, and a separate
comparison with the project's direct CLI to human and JSON results. The comparison can be
`same`, `different`, `absent`, `no-project` or `unavailable`; a different installation is not
necessarily global. Calls without the flag expose no location path. All version queries are
offline. Malformed or missing required installed metadata produces status `1` and a sanitised
`ASTER-CLI-011` failure, without partial output. Human failures go to stderr and JSON failures
to stdout. Missing Core or SVG before the CLI starts remains a native Node failure. See
[Version Metadata](version/index.md) for acquisition and validation boundaries.

## Catalogue and plan execution

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

The [presentation boundary](presentation/index.md) plans complete streams before process writes.

## Runtime composition

The shell is divided into [Parsing](parsing/index.md), [Presentation](presentation/index.md),
[Output](output/index.md), and private [Version Metadata](version/index.md) subfeatures.
`NodeShell` coordinates the active command and output boundaries without moving host authority
into the programmatic command API.

| Class | Responsibility |
| --- | --- |
| `CommandLineParser` | Dispatches argv adaptation to explicit command-owned parsers. |
| `CommandOutputPresenter` | Selects human or JSON presentation, streams, and exit status. |
| `ShellDiagnosticFactory` | Adapts parser, output-host, and unexpected shell faults into canonical command diagnostics. |
| `NodeShell` | Coordinates requested host evidence, command execution and optional complete export/review publication. |

The entrypoint alone reads argv and commits process streams/status. Private Output and Version
Metadata collaborators own filesystem and installed-manifest access. The
[compatibility boundary](../compatibility.md#runtime-compatibility) keeps Node types out of the
programmatic root.

Host-neutral command semantics remain authoritative in [CLI Command](../command/index.md),
[CLI Export](../export/index.md), and [CLI Review](../review/index.md). [CLI Workflow](../workflow.md)
defines how this private adapter composes them without transferring Node authority into the public
root.
