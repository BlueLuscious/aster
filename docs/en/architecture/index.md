# Architecture

Aster architecture is defined incrementally from accepted decisions and implementation evidence.

- [Authority and Vocabulary](authority-and-vocabulary.md) defines source precedence, shared terms,
  and decision states.
- [Product and Package Boundaries](product-and-package-boundaries.md) defines project
  responsibilities, dependency direction, package-creation rules, and external integrations.
- [Collection and Source Boundary](collection-and-source-boundary.md) defines collection
  ownership, lifecycle, visual-rule authority, and canonical asset roles.
- [Metadata and Identity Boundary](metadata-and-identity-boundary.md) defines metadata composition,
  naming, identity, deprecation, RTL, and licensing resolution.
- [Portable Icon Model](portable-icon-model.md) defines target-independent icon geometry,
  presentation, immutability, and extension rules.
- [SVG Processing Pipeline](svg-processing-pipeline.md) defines parsing, safety, validation,
  normalisation, construction, and generation boundaries.
- [Diagnostics and Determinism](diagnostics-and-determinism.md) defines stable diagnostics,
  ordering, and byte-reproducible generation.
- [Rendering Contract](rendering-contract.md) defines renderer authority, portable options,
  presentation precedence, and the first SVG result.
- [Accessibility and Direction](accessibility-and-direction.md) defines decorative and semantic
  intent, conflict handling, and RTL behaviour.
- [Distribution and Adapters](distribution-and-adapters.md) defines variants, exports,
  tree-shaking, named integrations, and target separation.
- [Command-line Boundary](command-line-boundary.md) defines the host-neutral Aster command set,
  explicit catalogue discovery, standalone Node shell, and plugin-host compatibility.

Documents marked as **Accepted** define current architecture. Draft documents are proposals and
cannot silently override accepted contracts.
