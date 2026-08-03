# CLI Shell

Status: **Experimental**

The shell feature is the private Node adapter over the public `AsterCommands` composition. It owns
argv tokenisation, the built-in executable context, presentation, stdout, stderr, and process exit
status. It does not own command validation, catalogue queries, portable values, or provider
normalisation.

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
aster help [list|search|show]
aster version
```

Invoking `aster` without arguments is equivalent to `aster help`. A query containing spaces must
be supplied as one quoted shell argument. `--tag` may be repeated; singleton filters and `--json`
may not be repeated. Unknown options and extra positional arguments are usage failures.

The shell explicitly supplies `AsterCatalogue`. This is executable composition rather than an
ambient default in `AsterCommands`.

## Presentation

Human output is plain deterministic text with no terminal-width or mandatory ANSI behaviour.
Successful human output is written to stdout. Expected human failures are written to stderr with
their stable diagnostic code and any related values.

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
| `1` | Lookup, catalogue, execution, or shell failure. | stderr | stdout |

Presentation receives an immutable result and returns complete stream strings plus status before
the entrypoint performs any process write. Presentation therefore cannot mutate or alter command
behaviour.

## Runtime Composition

| Class | Responsibility |
| --- | --- |
| `CommandLineParser` | Separates shell presentation and adapts positional command forms. |
| `CommandLineOptionParser` | Parses closed command-specific singleton filters and repeated tags. |
| `CommandOutputPresenter` | Selects human or JSON presentation, streams, and exit status. |
| `HumanOutputPresenter` | Renders plain help, list, search, show, version, and failure text. |
| `JsonOutputPresenter` | Serialises one unstyled structured result document. |
| `ShellDiagnosticFactory` | Adapts parser and unexpected shell faults into canonical command diagnostics. |
| `NodeShell` | Delegates parsed invocations to `AsterCommands` with explicit product and catalogue context. |

The executable entrypoint is the only module that imports `node:process`. The host-neutral
compiler excludes the complete shell tree. The referenced shell project consumes host-neutral
declarations, admits Node types, and emits only the private binary modules. Importing `@aster/cli`
resolves only the side-effect-free programmatic root and never evaluates the entrypoint.

The authoritative command and output semantics are defined by the
[Command-line Boundary](../../../architecture/command-line-boundary.md).
