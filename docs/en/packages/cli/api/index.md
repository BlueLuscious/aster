# CLI API

Status: **Pre-release**

The API feature is the explicit composition root for the immutable host-neutral `AsterCommands`
value. It wires command definitions, invocation normalisers, catalogue queries and export planning
without importing the standalone shell or selecting a catalogue provider implicitly.

## Public authority

`AsterCommands` implements `AsterCommandSet`:

```ts
const result = await AsterCommands.execute(invocation, context);
```

Its `identity` is `aster`. Its descriptor sequence is a canonical immutable snapshot of the
implemented `export`, `help`, `list`, `search`, `show`, and `version` definitions. Reading identity
or descriptors loads no catalogue and executes no command.

`execute()` accepts one structured invocation and one explicit `AsterCommandContext`. It delegates
acceptance to the owning command normaliser, validates the context, dispatches through the fixed
command composition, and returns one immutable structured result. Expected failures are data;
unexpected command faults are sanitised by the command kernel.

## Composition boundary

The API owns shared stateless runtime instances only where the complete command set uses them. The
catalogue loader is explicit command composition, not a provider registry. The built-in
`AsterCatalogue` remains a separate value that a host may include in the context; it is never
captured as an ambient default.

Adding a command requires its own invocation normaliser and definition plus explicit composition
here. It may additionally require a shell parser or presenter, but the programmatic authority
cannot import those Node-facing collaborators.

The API retains no invocation, context, result, provider snapshot, filesystem, process, terminal,
network, DOM, framework, package-manager, or repository-tooling state. Importing the package root
exposes this value without executing the private `aster` entrypoint.

## Relations

- [CLI Command](../command/index.md) defines public invocation, context, result and diagnostic
  contracts.
- [CLI Command Runtime](../command/runtime/index.md) defines validation, dispatch and failure
  sanitisation.
- [CLI Catalogue](../catalogue/index.md) defines explicitly supplied provider capabilities.
- [CLI Export](../export/index.md) defines immutable target artefact planning.
- [CLI Workflow](../workflow.md) traces programmatic and standalone execution.
