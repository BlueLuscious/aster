# Import API

Status: **Private workspace API**

`IconImport` is a frozen object implementing `IconImportApi`. Every operation is synchronous,
host-independent and deterministic; parsing or module emission does not perform host effects.

## Operations

| Operation | Input and result | Independent responsibility |
| --- | --- | --- |
| `inspect()` | `IconImportSourceType` to `DiagnosticResultType<IconImportDraft>` | Exposes metadata-free geometry and source evidence for review. |
| `define()` | `IconImportDefinitionRequest` to `DiagnosticResultType<IconDefinition>` | Applies reviewed metadata through Core without reparsing source. |
| `emit()` | `IconModuleEmissionRequest` to `DiagnosticResultType<IconModuleOutput>` | Serialises a definition without requiring its original source. |
| `adopt()` | `IconAdoptionRequest` to `DiagnosticResultType<IconAdoptionOutput>` | Composes all three stages for one source. |
| `adoptMany()` | Readonly `IconAdoptionRequest[]` to `DiagnosticResultType<IconAdoptionBatchOutput>` | Adds atomic collision checks and canonical batch order. |

[Adoption](../adoption/index.md) owns these inputs/outputs and their Core relationships;
[Source](../source/index.md) owns acquired input. Expected rejection returns
[diagnostics](../diagnostic/index.md); malformed API structure throws
[`IconImportError`](../error/index.md). Explicit caller-controlled execution failures preserve
their original identity.

## Staged usage

```ts
import { IconImport, iconImportFormats } from "@luscious-garden/aster-import";

const inspected = IconImport.inspect({
  format: iconImportFormats.svg,
  sourceId: "external/disc.svg",
  identity: { namespace: "example", name: "disc", variant: "outline" },
  content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/></svg>',
});

if (!inspected.successful) {
  throw new Error(JSON.stringify(inspected.diagnostics));
}

const defined = IconImport.define({
  draft: inspected.value,
  metadata: {
    displayName: "Disc",
    rtl: "preserve",
    presentation: { defaults: {}, overrides: [] },
    deprecated: false,
  },
});

if (!defined.successful) {
  throw new Error(JSON.stringify(defined.diagnostics));
}

const emitted = IconImport.emit({
  definition: defined.value,
  sourceIds: [inspected.value.provenance.sourceId],
});

if (!emitted.successful) {
  throw new Error(JSON.stringify(emitted.diagnostics));
}

const { suggestedPath, content } = emitted.value;
```

This private workspace example does not install Import from a public registry. A real host reviews
the draft and metadata between calls and handles every diagnostic or failure before persistence.
This example stops on rejection by throwing its diagnostics; an interactive host may instead
present them and request corrections without continuing to the next stage.

## Composition and exports

One module-local `IconAdoptionService` and immutable built-in adapter registry retain no caller
data or mutable registration. They are shared stateless composition, not operation caches.

Only the root is exported. Runtime values are `IconImport`, `IconImportError` and
`iconImportFormats`; declaration families belong to API, Adoption, Diagnostics, Format and Source.
[Compatibility](../compatibility.md) defines the private distribution boundary.
