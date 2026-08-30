# Immutable Definition Runtime

Status: **Accepted**

The internal definition runtime converts one authored object into an isolated, deterministic, and
deeply frozen `IconDefinition`. It is not a public package export.

Concrete runtime responsibilities are implemented as classes. `IconDefinitionFactory` composes
normaliser instances through native `#` private fields; normalisers keep supporting behaviour in
private methods rather than loose module functions. The frozen public
[`Icon` API object](../../api/index.md) owns the shared factory instance.

## Construction flow

1. `IconDefinitionFactory` accepts an unknown value and rejects fields outside the closed
   definition shape.
2. `IconIdentityNormaliser` trims and validates optional namespace, icon, and variant slugs.
3. `IconViewBoxNormaliser` validates finite coordinates and positive dimensions.
4. `IconNodeNormaliser` validates the discriminator, geometry, presentation, cardinality, and
   original paint order of every node.
5. `IconMetadataNormaliser` validates resolved metadata, intrinsic tags, presentation policy,
   licensing relationships, deprecation, and self replacement.
6. Every retained object and sequence is newly constructed and frozen before the definition is
   returned.

## Runtime responsibilities

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconDefinitionFactory` | Owns the complete validation, normalisation, isolation, and deep-freeze transaction. | Composes all definition, node, and metadata normalisers. |
| `IconIdentityNormaliser` | Trims and validates complete canonical icon identities. | Reused for owning and replacement identities. |
| `IconViewBoxNormaliser` | Validates finite minima and positive logical dimensions. | Produces the definition coordinate system. |

Primitive assertions and deterministic contract failures are documented by the
[Core shared runtime](../../shared/index.md).

Presentation fields use fixed construction order. Hexadecimal sRGB colours are lowercased,
three-digit colours expand to six digits, negative zero becomes zero, and override capabilities
use canonical semantic order.

## Error boundary

Invalid authored data raises the deterministic `IconDefinitionError` documented by the
[Core shared runtime](../../shared/index.md). The complete construction transaction terminates
without returning partial data.

## Identity scope

Core rejects a replacement that points to the definition itself. It deliberately allows separate
definitions with equal identity because it owns no global registry.

Duplicate identities, unavailable replacement targets, and replacement cycles require a complete
catalogue or publication unit and remain responsibilities of the consumer that owns that set.

## Path-data scope

Core trims path data and requires non-empty text. Canonical TypeScript authors own reviewed path
syntax directly. Full SVG path parsing, canonical rewriting, and source-span diagnostics for
external inputs belong to the optional Import SVG adapter before Core construction.

## Isolation

Normalisers retain no caller-owned object or array. Mutating authored input after construction
cannot alter the accepted definition. The result contains plain data only and remains JSON
serialisable.
