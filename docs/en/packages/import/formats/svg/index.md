# Import SVG Adapter

The SVG adapter is the first private implementation of Import's format contract. It composes
[parsing](parser/index.md), [technical validation](validation/index.md),
[normalisation](normalisation/index.md) and [SVG-shared authorities](shared/index.md).

It accepts a strict portable subset, preserves exact source diagnostics and produces a deeply
frozen metadata-free draft. `xmlsax-typescript@1.0.0` remains confined to the parser implementation.

The finite editor-noise policy accepts a legal XML declaration, comments, unused namespace
declarations, empty groups and safe root editor attributes. Discarded attributes produce exact
non-blocking warnings. Executable content, resources, foreign namespace use, entities, doctypes,
CDATA, text, transforms and unknown semantics remain blocking.

