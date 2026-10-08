# Core Workflow

Status: **Accepted**

This page traces authored input through Core construction and into independent consumers.
Individual feature pages own field rules and canonical representations.

## Icon construction

`Icon.define(authoredDefinition)` starts one synchronous transaction:

```text
authored value
    |
    v
Icon API -> IconDefinitionFactory
    |
    +--> closed definition shape
    +--> identity and viewBox
    +--> ordered geometry and presentation
    +--> metadata and presentation policy
    |
    v
isolated deeply frozen IconDefinition
```

The [definition runtime](definition/runtime/index.md) composes those normalisers and reconstructs
every retained object and sequence. [Shared data acceptance](shared/index.md#data-acceptance)
applies before feature-specific normalisation. Invalid input returns no partially constructed
value; numeric, textual, geometric and metadata constraints remain with their
[feature owners](index.md#documentation).

The [API example](api/index.md#usage) demonstrates complete authoring. Construction is necessary
even when TypeScript accepts the input shape: static readonly properties do not validate or freeze
an object at runtime.

## Collection construction

`Collection.define(authoredCollection)` composes an independent identity and metadata value with
keyed membership:

```text
authored collection
    |
    v
Collection API -> CollectionDefinitionFactory
    |
    +--> closed collection shape
    +--> validate aliases and reconstruct every icon
    +--> compare canonical graphs before reference retention
    +--> reject duplicate identities
    +--> freeze icons and derive members once
    +--> check submitted members during complete-definition revalidation
    +--> normalise collection identity and metadata
    |
    v
deeply frozen CollectionDefinition
```

The [Collection feature](collection/index.md) owns alias grammar, generic input/output,
deterministic ordering and the canonical matcher. Its `icons` dictionary is the authored
authority; `members` is a derived frozen data property, not a second membership source.
A complete definition can be revalidated, including after a JSON round trip, only when both views
agree in canonical values and order.

## Consumer hand-off

Accepted definitions are plain data without getters, mutation methods or lifecycle behaviour.
After construction, Core performs no further work until an explicit consumer receives the value.

The [package dependency graph](../index.md) identifies those consumers. Icons owns distribution;
SVG owns target rendering; Import owns acquired-source inspection and adoption; CLI owns catalogue
and host operations. Their responsibilities do not enlarge Core's portable model.

## Security and trust boundary

Core validates data and isolates accepted values; it is not a JavaScript sandbox. Ordinary
accessor descriptors are rejected without invoking their getters, and inherited fields cannot
satisfy the closed data contract. Reflective inspection of a hostile proxy can still execute
caller-controlled traps. Such execution failures propagate without being relabelled as
[`IconDefinitionError`](shared/index.md#error).

Acquire and decode untrusted bytes in an explicit host or source pipeline before construction.
Core owns no filesystem, network, DOM, process, parser or global identity state. Importing the
package performs no registration or host initialisation.
