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

Well-formed XML is necessary but does not imply acceptance by this source subset. The complete
markup from [SVG Render Result](../../../svg/render/index.md) is a rendering target, not a
round-trip Import source: decorative `aria-hidden` and `focusable` were already unsupported, and
the fixed `data-rendered-by` root attribute is also rejected with `ASTER-TECHNICAL-005`. Unknown
`data-*` attributes remain blocking rather than silently discarded. Import does not broaden its
editor-noise policy to accept renderer output.
