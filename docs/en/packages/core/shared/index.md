# Core Shared Runtime

Status: **Accepted**

The shared feature owns primitive authored-value assertions and deterministic Core contract
failures used by normalisers across package features. It contains no portable domain vocabulary,
host authority, parser behaviour, registry, or mutable global state.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `CanonicalSlugNormaliser` | Validates stable ASCII lowercase `kebab-case` domain slugs. | Shared by icon, collection, and intrinsic-tag normalisers. |
| `IconValueValidator` | Provides plain-object, exact data-field, text, number, boolean, opacity, and dense-array assertions. | Used only by internal Core normalisers. |
| `IconDefinitionError` | Represents deterministic invalid-definition failures with code `ASTER-CORE-001` and a logical object path. | Raised by validators and normalisers; exported only through the package root. |

`IconValueValidator` accepts unknown authored values and returns only locally validated primitive
representations. Object records may use `Object.prototype` or a null prototype, but accepted fields
must be own enumerable string-keyed data properties. Arrays must be dense and cannot carry symbols,
accessors, hidden elements, or authored non-index properties. The validator does not infer domain
semantics such as node cardinality, presentation precedence, identity relationships, or renderer
authority; those rules remain with their owning features.

`IconDefinitionError` is a programming error for malformed authored portable data. Its message
contains no host path, parser failure, source location, or environment state. Import source
failures remain structured diagnostics rather than Core definition errors. Consumers can use the
public frozen class for `instanceof` discrimination and inspect its stable static or instance
`code` and logical `path`; the validators that produce it remain private.

Shared runtime classes are stateless and constructed by the normalisers that consume them. They do
not require package-level singletons because they own no shared lifecycle, identity, or replaceable
host boundary. Only the terminal definition error crosses the root API boundary.
