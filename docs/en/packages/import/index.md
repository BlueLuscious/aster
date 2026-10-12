# Import

Status: **Private workspace package**

`@luscious-garden/aster-import` is a host-independent adoption compiler for explicitly acquired
external sources. It inspects untrusted text, combines a metadata-free draft with host-reviewed
Core metadata and returns an editable `.icon.ts` module. It remains private even when its source
version matches a public stable package.

## Documentation

| Owner | Responsibility |
| --- | --- |
| [API](api/index.md) | Five synchronous operations, root exports and staged usage. |
| [Adoption](adoption/index.md) | Drafts, reviewed construction, editable modules and atomic batches. |
| [Source](source/index.md) and [formats](format/index.md) | Explicit acquired text and immutable adapter selection. |
| [Diagnostics](diagnostic/index.md) and [errors](error/index.md) | Located result evidence versus malformed-invocation exceptions. |
| [SVG adapter](formats/svg/index.md) | Strict source subset and parser/validation/normalisation hand-offs. |
| [Shared](shared/index.md) | Private cross-feature value and identity validation. |
| [Workflow](workflow.md) | Review and persistence hand-off to the host. |
| [Compatibility](compatibility.md), [quality](quality.md) and [baseline](quality-baseline.md) | Private distribution, conformance and historical measurements. |
| [Private version history](releases/index.md) | Reviewed source boundaries, not npm or GitHub Releases. |

## Boundary

Import owns no filesystem, terminal, process, network, source discovery, overwrite, cleanup,
collection membership or package-generation authority. The host acquires and decodes input,
reviews metadata and decides whether to retain emitted content as human-owned source.

Import depends on public Core construction and a confined private XML parser. Retained modules
depend only on Core; rendering and future editing require neither Import nor the original source.
[Compatibility](compatibility.md) owns the dependency and private-consumer guarantees.
