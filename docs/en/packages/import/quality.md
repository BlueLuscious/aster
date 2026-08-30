# Import Quality

Status: **Hardened private pre-release**

Import quality is defined through public-operation, adapter, ABI and representative workflow
conformance rather than through publication status.

The [Import Quality Baseline](quality-baseline.md) records the current surface inventory,
operation ownership, internal dependency direction and reproducible performance scenarios.

## Guarantees

- Every public operation is deterministic for equivalent accepted input.
- Successful drafts, definitions, modules, batches and diagnostic envelopes are isolated from
  later caller mutation and deeply frozen, including individual geometry nodes.
- Plain records and dense arrays reject hidden, symbolic, accessor-owned or unexpected state.
- Caller-controlled execution failures preserve their identity; malformed owned structure uses
  `IconImportError` with stable logical paths.
- Batch adoption is all-or-nothing, collision-aware and canonically ordered.
- The SVG adapter blocks unsafe XML, external resources, executable content, unsupported
  semantics, malformed documents and configured resource-limit violations.
- Editable module output has no generated marker, overwrite authority, cleanup lifecycle or
  dependency on Import.

## Package evidence

Runtime tests exercise all five public operations, representative SVG sources, editor noise,
diagnostics, reflective inputs, sparse arrays, cycles, post-call mutation and independent
collection-scale batches. ABI tests build and import the package root, assert the exact runtime and
declaration surface, reject implementation subpaths and inspect emitted ESM dependencies.

An isolated TypeScript consumer compiles an emitted `.icon.ts` module and renders it through
`@aster/svg` without importing Import. Repository workflows separately prove equivalence between
TypeScript-first and adopted definitions.

The package-owned advisory benchmark compares the original operation matrix and explicit source
and batch scales. Current evidence remains linear for representative accepted geometry and batch
growth. Inspection owns the material cost; Core definition construction and editable module
emission remain comparatively small. No runtime shortcut is accepted unless it preserves parser
safety, source evidence, caller isolation and deterministic diagnostics.

## Non-guarantees

Import does not guarantee filesystem acquisition, encoding detection, source discovery, metadata
inference, collection policy, cross-collection atomicity, SVG-first regeneration, output
commitment, overwrite handling, package scaffolding or alternate-format support. Those
responsibilities require an explicit host or independently accepted future capability.
