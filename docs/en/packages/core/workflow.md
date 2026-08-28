# Core Workflow

Status: **Accepted**

This document explains how authored values enter `@aster/core`, become canonical immutable icon or
collection definitions, and leave Core for independent consumers. Feature documents remain the
authority for individual contracts and normalisers.

## Icon construction

The public entry point is:

```ts
const icon = Icon.define(authoredDefinition);
```

The compile-time parameter is `IconDefinition`, but runtime construction never trusts that
annotation. JavaScript callers, decoded data, generated modules, and TypeScript escape hatches can
still supply malformed values.

Construction proceeds as one synchronous transaction:

```text
authored value
    |
    v
Icon API
    |
    v
IconDefinitionFactory
    |
    +--> validate exact root fields
    +--> normalise identity
    +--> normalise viewBox
    +--> normalise and freeze ordered nodes
    +--> normalise metadata and presentation policy
    |
    v
isolated deeply frozen IconDefinition
```

The root must be a plain closed object containing `identity`, `viewBox`, `nodes`, and `metadata`.
Every retained domain field must be an own enumerable string-keyed data property. Unknown fields,
symbols, non-enumerable fields, accessors, custom prototypes, sparse arrays, and authored array
properties are rejected rather than ignored. Each feature normaliser validates its own numeric,
textual, cardinality, vocabulary, ordering, and relationship rules before creating new retained
objects.

Identity is canonical ASCII lowercase slug data. The viewBox has finite minima and positive finite
dimensions. Nodes form a non-empty ordered sequence from the closed portable geometry union.
Metadata resolves display information, intrinsic tags, RTL policy, presentation policy, licensing,
deprecation, and optional replacement identity.

Canonicalisation includes trimming accepted text, normalising negative zero, expanding and
lowercasing hexadecimal colours, ordering closed presentation capabilities, and cloning retained
arrays and objects. The returned graph is deeply frozen and no mutable authored array or nested
object is retained by reference.

If any stage fails, construction throws one deterministic Core programming error before returning a
definition. The error identifies the stable Core code and logical value path. No partially
normalised value is observable.

## Collection construction

The collection entry point is:

```ts
const collection = Collection.define(authoredCollection);
```

Collection construction validates the exact root fields `identity`, `icons`, and `metadata`. It
then processes every member through the icon construction authority, ensuring that mutable or
structurally invalid icon-shaped input cannot enter membership merely because TypeScript accepts
its shape.

```text
authored collection
    |
    v
Collection API
    |
    v
CollectionDefinitionFactory
    |
    +--> validate exact collection fields
    +--> validate and isolate every icon member
    +--> reject duplicate canonical icon identities
    +--> normalise collection identity
    +--> normalise collection metadata
    |
    v
isolated deeply frozen CollectionDefinition
```

An already deeply frozen canonical icon may be retained after successful reconstruction proves its
complete shape and a dedicated matcher confirms equal prototypes, field order, primitive values,
and graph topology without cycles, repeated aliases, hidden state, or accessor semantics. Every
other valid candidate uses the isolated canonical reconstruction. Membership order is preserved,
identities must be unique within one collection, and the same canonical icon may belong to multiple
independent collections without acquiring collection state.

A collection may be empty. It remains a valid identity and metadata authority rather than an icon
registry.

## Result model

Definitions are plain readonly data, not class instances, controllers, stores, or lifecycle
objects. Consumers read fields directly:

```ts
icon.identity.name;
collection.icons;
```

This representation remains serialisable, structurally interoperable, renderer-neutral, and easy
to inspect. It deliberately has no getters, setters, mutation methods, hidden registration, or
prototype-owned domain behaviour.

Future immutable composition helpers, if justified, belong to the frozen `Icon` or `Collection`
API authorities and return a new canonical definition. They do not mutate an existing definition
or turn the portable data graph into a live instance.

## Consumer hand-off

After construction, Core performs no work until another explicit API receives the value:

- `@aster/icons` exports canonical definitions and explicit collection aggregates;
- `@aster/svg` interprets one definition and render options as standalone SVG markup;
- `@aster/import` converts accepted external source evidence into Core values;
- `@aster/cli` reads definitions through explicit catalogue providers;
- future adapters may map definitions into target-specific occurrences and lifecycle state.

Those consumers may add target, catalogue, filesystem, process, or lifecycle responsibilities at
their own boundaries. They cannot move those responsibilities back into Core.

## Security and trust boundary

Core validates data invariants and protects accepted values from caller mutation. It is not a
JavaScript sandbox: reflective inspection of a hostile proxy, or reading fields before an accessor
descriptor is rejected, can execute caller-controlled behaviour before Core can classify the
value. Such execution failures are propagated rather than relabelled as Core validation errors.
Acquisition and decoding of untrusted bytes belong to an explicit host or source pipeline before
Core construction.

Core itself owns no filesystem, network, DOM, process, parser, framework, catalogue registry, or
global identity state. Importing it performs no registration or host initialisation.

## Related documentation

- [Core API](api/index.md) defines the public construction authorities and usage.
- [Immutable Definition Runtime](definition/runtime/index.md) defines icon construction internals.
- [Core Collection](collection/index.md) defines membership and collection construction.
- [Core Quality](quality.md) records accepted conformance evidence and future pressure boundaries.
- [Portable Icon Model](../../architecture/portable-icon-model.md) defines the project-level model.
