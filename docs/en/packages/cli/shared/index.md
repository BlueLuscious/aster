# CLI Shared Authorities

Status: **Pre-release**

The CLI shared feature owns internal deterministic authorities used by more than one host-neutral
feature. It is not exported from `@aster/cli` and grants no process, filesystem, terminal, network,
package-manager, framework, or plugin capability.

## Authorities

| Authority | Responsibility |
| --- | --- |
| `cliIdentitySchema` | Defines the closed lowercase ASCII slug and textual identity separators used by command and catalogue input. |
| `CanonicalIdentityValidator` | Validates provider, collection, and icon identity strings against the shared grammar. |
| `AsciiStringComparator` | Applies deterministic lexical ordering without locale dependence. |
| `StructuredDataInspector` | Snapshots exact plain records and dense ordinary arrays without executing authored accessors. |

`StructuredDataInspector` accepts records whose prototype is either `Object.prototype` or `null`.
Every accepted field must be an own enumerable data property from a caller-supplied closed set.
Symbols, hidden fields, accessors, custom prototypes, unknown fields, sparse arrays, array
subclasses, and authored array properties are rejected. Returned containers are shallow frozen
snapshots; each owning normaliser remains responsible for validating and isolating nested domain
values.

A Proxy receives no special trust. It can only cross a data boundary when every observed
prototype, key, and descriptor satisfies the same closed invariants; thrown reflective traps are
translated by the owning command or provider boundary without retaining native exception text.

Catalogue providers are capabilities rather than serialisable data. Command context acceptance
therefore snapshots their canonical identity and callable `load` member separately while retaining
the original receiver needed by class implementations. Provider results still enter the strict
structured-data and Core reconstruction boundaries before becoming observable catalogue state.

These authorities remain internal because their exact acceptance mechanics are CLI policy, not a
portable Core contract or public extension ABI.
