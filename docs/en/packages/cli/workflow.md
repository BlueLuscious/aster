# CLI Workflow

Status: **Accepted**

CLI separates immutable command results from standalone host effects. Feature pages own accepted
values and failure semantics; this page traces their composition.

## Programmatic execution

1. A host supplies a structured invocation and explicit [command context](command/index.md).
2. [Invocation acceptance](command/invocation/index.md) selects the command-owned normaliser.
3. The [kernel](command/runtime/index.md) accepts context and dispatches the explicit definition.
4. Discovery commands use [catalogue metadata](catalogue/index.md); Export and Review additionally
   resolve one exact icon or collection through the [catalogue runtime](catalogue/runtime/index.md).
5. [Export](export/index.md) builds SVG artefacts, or [Review](review/index.md) builds technical
   evidence, using public SVG rendering.
6. Execution returns one complete immutable success or sanitised failure.

`help` and `version` do not discover providers. Version commands consume host-supplied evidence,
not ambient installation state. Importing the package root does not execute this workflow.

## Standalone execution

The [shell](shell/index.md) parses argv, acquires only requested
[version evidence](shell/version/index.md), and calls the same `AsterCommands` value as a
programmatic host. After complete execution it selects an effect:

| Mode | Hand-off |
| --- | --- |
| Human or JSON | [Presentation](shell/presentation/index.md) plans complete streams and exit status. |
| Raw icon SVG | Presentation writes the sole successful artefact to stdout. |
| Export output root | [Output](shell/output/index.md) stages and commits the complete logical artefact tree. |
| Human review | Review serialises the complete plan; Output publishes a static `index.html`. |
| JSON review | Presentation returns the plan without filesystem effects. |

Output paths, replacement intent and presentation mode never enter the structured invocation.
Publication starts only after a complete successful plan; a failure exposes no partial plan or
success summary. Output owns staging, replacement, cleanup and recovery limitations.

The entrypoint commits the selected stdout, stderr and status effects. It does not reinterpret
catalogue definitions, compile sources or launch a browser. Repository authoring and regeneration
remain [tooling](../../tooling/catalogue/index.md) responsibilities.
