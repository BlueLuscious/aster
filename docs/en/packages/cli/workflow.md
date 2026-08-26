# CLI Workflow

Status: **Experimental**

This document describes how `@aster/cli` turns one explicit invocation into an observable result
without merging host-neutral command behaviour with standalone Node effects. Feature contracts and
types remain documented by [Command](command/index.md), [Catalogue](catalogue/index.md),
[Export](export/index.md), and [Shell](shell/index.md).

## Programmatic execution

An independent host mounts the frozen `AsterCommands` command set under its `aster` identity. For
each execution, the host supplies one structured invocation and an `AsterCommandContext` containing
product metadata and an explicit ordered set of catalogue providers.

The command kernel performs this flow:

1. Validate and normalise the invocation and context without consulting ambient state.
2. Select the exact command definition from the closed command authority.
3. Load only the catalogue providers required by that command.
4. Validate, isolate, freeze, and canonically order retained catalogue values.
5. Execute discovery, help, version, or export behaviour.
6. Return one immutable structured success or sanitised failure result.

Provider registration order, locale, filesystem enumeration, and current directory do not alter
accepted command results. `help` and `version` do not load providers. Importing the package root
does not execute this workflow.

## Export planning

For `export`, the host-neutral path selects one exact icon or collection from the accepted
catalogue snapshot. It delegates rendering to the public `@aster/svg` root and constructs a
complete immutable `AsterExportPlan` before returning success.

An icon produces one logical SVG artefact. A collection resolves every declared member before
rendering and then orders all artefacts by canonical relative path. Selection, path collisions,
render failures, and malformed providers fail without exposing a partial plan. The workflow does
not import `@aster/build`, inspect source files, or acquire filesystem authority.

## Standalone execution

The private `aster` executable adapts process arguments to the same structured invocation used by
programmatic hosts. It executes the complete host-neutral command before selecting one shell mode:

| Mode | Observable effect |
| --- | --- |
| Human | Writes deterministic help, discovery, version, summary, or failure text to the documented stream. |
| JSON | Serialises the complete structured result as one compact document followed by one newline. |
| Raw SVG | Writes one successful icon artefact directly to stdout. |
| Output root | Publishes a complete successful export plan beneath one explicit absent destination. |

The output-root host resolves only canonical relative artefact paths. It creates a unique sibling
stage, writes the complete tree, and performs one final rename to make the destination visible. It
never silently replaces an existing destination. On a current-run failure it removes only the
stage it owns and returns an Aster diagnostic without exposing native filesystem messages.

## Authority boundaries

`AsterCommands` owns command validation, catalogue selection, rendering orchestration, and
immutable result construction. It owns no argv, stream, process, filesystem, network,
package-manager, DOM, framework, repository-tooling, or ambient registry capability.

The private shell owns argv, current-directory input, process streams, exit status, path
resolution, and filesystem commitment. These authorities do not appear in public declarations or
exportable implementation subpaths. The exact ABI and consumer evidence are documented by
[CLI Compatibility and Conformance](compatibility.md).
