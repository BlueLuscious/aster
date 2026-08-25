# 0006: Public Portable Runtime Authorities

Status: **Superseded**

Owners: **Technical maintainers**

Date: **2026-07-30**

Affected documents:

- [Portable Icon Core](../packages/core/index.md)
- [Portable Icon Model](../architecture/portable-icon-model.md)
- [SVG Render Runtime](../packages/svg/render/runtime/index.md)

Supersedes: **None**

Superseded by: **[0009: Core Runtime Authority and Failure Boundary](0009-core-runtime-authority-failure-boundary.md)**

## Context

Core public unions derive from immutable runtime constants, but those constants were initially
private to the package. The first generic renderer consequently had no public authority for
dispatching node kinds, validating render vocabularies, applying RTL policy, or resolving
technical presentation. Importing Core implementation paths would violate the package boundary,
while duplicating the same values in each target would permit runtime and type semantics to drift.

## Decision drivers

- Keep portable vocabularies owned by Core.
- Let renderers and adapters consume runtime authorities through the approved root export.
- Preserve type derivation from the same immutable values used at runtime.
- Avoid exposing normalisers, factories, errors, mutable registries, or implementation subpaths.
- Expand the compatibility surface only for demonstrated consumer requirements.

## Options

### Keep every authority private

Each consumer would need raw literals or competing constants for public Core discriminators and
option values.

### Expose all Core constants

This would avoid private imports but would publish validation order and other implementation
details without a consumer requirement.

### Expose the narrow portable consumer authorities

This publishes only closed values needed to interpret public contracts while retaining
implementation-owned constants privately.

## Decision

Export the following deeply immutable values from the `@aster/core` root:

- `iconDirections`;
- `iconNodeKinds`;
- `iconPaintSchema`;
- `iconPresentationEnumerations`;
- `iconPresentationOverrideOrder`;
- `iconRtlPolicies`;
- `iconTechnicalPresentation`.

These values are part of the public runtime ABI. Matching public unions continue to derive from
their owning constants. `iconTechnicalPresentation` owns the complete lowest-precedence
presentation of the portable model.

Keep `iconPresentationFields` and every class or implementation path private. Source packages may
reuse a public authority only where their source and portable semantics are exactly equivalent;
otherwise they retain an explicit source-to-portable transformation.

## Consequences

### Positive

- Renderers dispatch and validate against the same authorities as Core.
- Portable defaults have one target-independent runtime owner.
- Consumers need no private Core imports.
- ABI tests can detect accidental value-surface or mutability changes.

### Negative

- Seven additional root values become compatibility contracts.
- Changes to their names, shapes, order, values, or immutability require versioning analysis.
- Source domains still need separate authorities where their semantics differ.

### Deferred

- Reuse these values from Build only after proving exact semantic equivalence for each source
  boundary.

## Compatibility and migration

This change occurs before a compatibility-bearing Core release. Existing type contracts retain
their values, and target consumers replace local copies with root imports. Future releases must
version incompatible runtime-authority changes alongside their derived public types.

## Evidence

- [Core Node](../packages/core/node/index.md)
- [Core Presentation](../packages/core/presentation/index.md)
- [Core Metadata](../packages/core/metadata/index.md)
- [Core Render Options](../packages/core/render/index.md)
- [SVG Render Runtime](../packages/svg/render/runtime/index.md)
