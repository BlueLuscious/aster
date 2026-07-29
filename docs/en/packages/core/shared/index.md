# Core Shared Runtime

Status: **Accepted**

The shared feature owns primitive authored-value assertions and deterministic Core contract
failures used by normalisers across package features. It contains no portable domain vocabulary,
host authority, parser behaviour, registry, or mutable global state.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconValueValidator` | Provides plain-object, exact-field, text, number, boolean, opacity, and array assertions. | Used only by internal Core normalisers. |
| `IconDefinitionError` | Represents deterministic invalid-definition failures with code `ASTER-CORE-001` and a logical object path. | Raised by validators and normalisers; not exported from the package. |

`IconValueValidator` accepts unknown authored values and returns only locally validated primitive
representations. It does not infer domain semantics such as node cardinality, presentation
precedence, identity relationships, or renderer authority; those rules remain with their owning
features.

`IconDefinitionError` is a programming error for malformed authored portable data. Its message
contains no host path, parser failure, source location, or environment state. Build source
failures remain structured diagnostics rather than Core definition errors.

Shared runtime classes are stateless and constructed by the normalisers that consume them. They
do not require package-level singletons or public contracts because they own no shared lifecycle,
identity, or replaceable host boundary.
