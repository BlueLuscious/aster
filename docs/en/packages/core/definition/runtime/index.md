# Immutable Definition Runtime

Status: **Accepted**

The internal definition runtime converts one authored object into an isolated, deterministic, and
deeply frozen `IconDefinition`. It is not yet a public package export.

Concrete runtime responsibilities are implemented as classes. `IconDefinitionFactory` composes
normaliser instances through native `#` private fields; normalisers keep supporting behaviour in
private methods rather than loose module functions. The frozen public
[`Icon` API object](../../api/index.md) owns the shared factory instance.

## Construction flow

1. `IconDefinitionFactory` accepts an unknown value and rejects fields outside the closed
   definition shape.
2. `IconIdentityNormaliser` trims and validates canonical collection, icon, and variant slugs.
3. `IconViewBoxNormaliser` validates finite coordinates and positive dimensions.
4. `IconNodeNormaliser` validates the discriminator, geometry, presentation, cardinality, and
   original paint order of every node.
5. `IconMetadataNormaliser` validates resolved metadata, presentation policy, licensing
   relationships, deprecation, and self replacement.
6. Every retained object and sequence is newly constructed and frozen before the definition is
   returned.

Presentation fields use fixed construction order. Hexadecimal sRGB colours are lowercased,
three-digit colours expand to six digits, negative zero becomes zero, and override capabilities
use canonical semantic order.

## Error boundary

Invalid authored data raises `IconDefinitionError`, a deterministic `TypeError` with code
`ASTER-CORE-001` and a logical object `path`. Messages use stable British English and contain no
host paths, parser failures, or environment state.

## Identity scope

Core rejects a replacement that points to the definition itself. It deliberately allows separate
definitions with equal identity because it owns no global registry.

Duplicate identities, unavailable replacement targets, and replacement cycles require a complete
generation unit and remain responsibilities of the build pipeline.

## Path-data scope

Core requires path data to be non-empty canonical text. Full SVG path parsing and source-span
diagnostics belong to the build pipeline, which validates path syntax before construction.

## Isolation

Normalisers retain no caller-owned object or array. Mutating authored input after construction
cannot alter the accepted definition. The result contains plain data only and remains JSON
serialisable.
