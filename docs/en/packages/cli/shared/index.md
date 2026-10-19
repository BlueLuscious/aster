# CLI Shared Authorities

Status: **Accepted**

The CLI shared feature owns internal deterministic authorities used by more than one host-neutral
feature. It is not exported from `@luscious-garden/aster-cli` and grants no process, filesystem, terminal, network,
package-manager, framework, or plugin capability.

## Authorities

| Authority | Responsibility |
| --- | --- |
| `cliIdentitySchema` | Defines the closed lowercase ASCII slug and textual identity separators used by command and catalogue input. |
| `CanonicalIdentityValidator` | Validates provider, glyph, collection and concrete icon strings against shared grammar without conflating their subject roles. |
| `AsciiStringComparator` | Applies deterministic lexical ordering without locale dependence. |
| `StructuredDataInspector` | Snapshots exact plain records and dense ordinary arrays without executing authored accessors. |

Provider identities and tags are lowercase ASCII kebab-case slugs. Collection identities use
`[namespace/]name`, as do glyph identities; icon identities require `[namespace/]name@variant`.
Every section follows the same slug grammar. These exact textual identities are not collection-local
aliases or inferred namespaces.

`StructuredDataInspector` accepts records whose prototype is either `Object.prototype` or `null`.
Every accepted field must be an own enumerable data property from a caller-supplied closed set.
Symbols, hidden fields, accessors, custom prototypes, unknown fields, sparse arrays, array
subclasses, and authored array properties are rejected. Record snapshots have a null prototype;
arrays retain the ordinary array prototype. Both are shallow frozen. Each owning normaliser remains
responsible for validating nested values and constructing the ordinary public domain records.

Descriptor admission requires an own `value` field, not an inherited claim on the descriptor.
Record snapshots copy accepted own fields without assigning through a prototype setter.
Downstream queries, identity projections and presenters preserve optional-field absence rather
than acquiring values from the host prototype; taking a shallow snapshot alone is not that guarantee.

A Proxy receives no special trust. It can only cross a data boundary when every observed
prototype, key, and descriptor satisfies the same closed invariants; thrown reflective traps are
translated by the owning command or provider boundary without retaining native exception text.

Catalogue providers are capabilities rather than serialisable data. Command context acceptance
therefore snapshots their canonical identity and callable `discover`, `loadIcon`, and
`loadCollection` members separately while retaining the original receiver needed by class
implementations. Discovery and definition results remain untrusted at their owning acceptance
boundaries.

These authorities remain internal because their exact acceptance mechanics are CLI policy, not a
portable Core contract or public extension ABI.
