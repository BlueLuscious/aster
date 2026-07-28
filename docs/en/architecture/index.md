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

Documents marked as **Accepted** define current architecture. Draft documents are proposals and
cannot silently override accepted contracts.
