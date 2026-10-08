# CLI API

Status: **Accepted**

The API composes the frozen host-neutral `AsterCommands` value from explicit command definitions,
invocation normalisers, catalogue queries and plan builders. It does not import the shell or select
a provider implicitly.

## Programmatic usage

`AsterCommands` implements [`AsterCommandSet`](../command/index.md). Its identity is `aster`;
descriptors are immutable and ordered by command name. Reading them executes no command.

```ts
import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";

const result = await AsterCommands.execute(
  { command: "show", subject: "icon", identity: "aster/camera" },
  {
    productName: "Aster",
    productVersion: "0.1.0",
    catalogues: [AsterCatalogue],
  },
);
```

The version is illustrative host metadata, not a registry query. Hosts may supply other explicit
[`CatalogueProvider`](../catalogue/index.md) implementations or an empty provider sequence.
They acquire requested version evidence themselves; the command API never reads installed manifests.

`execute()` accepts and isolates the invocation and context, then returns one immutable
structured result. Expected failures are data; unexpected faults cross the
[command runtime](../command/runtime/index.md) sanitisation boundary.

## Package exports

Only the root `"."` is public. Its six runtime values are `AsterCommands`, `AsterCatalogue`,
`catalogueResultKinds`, `exportTargets`, `reviewSubjects` and `reviewTargets`. Declaration-only
families are documented by their owners:

| Family | Contract and type owner |
| --- | --- |
| Execution, descriptors, invocation, context, payloads, results and diagnostics | [Command](../command/index.md) |
| Installed versions, dependency groups, selectors, provenance and CLI location | [Command](../command/index.md) |
| Provider capabilities, discovery records, results and result kinds | [Catalogue](../catalogue/index.md) |
| Artefacts, plans, subjects and render options | [Export](../export/index.md) |
| Icon evidence, documents, plans and subjects | [Review](../review/index.md) |

The manifest's `aster` binary mapping reaches a private entrypoint, not an exportable subpath.
[Compatibility](../compatibility.md) defines supported runtime and ABI evolution.

## Composition

One explicit composition owns shared stateless collaborators without retaining caller state.
Adding a command requires its own normaliser and definition; shell parsers and presenters remain
separate Node-facing collaborators. The API owns no host effects or mutable registry.
[Workflow](../workflow.md) traces the hand-offs.
