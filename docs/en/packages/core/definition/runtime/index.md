# Immutable Definition Runtime

Status: **Accepted**

The internal definition runtime accepts recognised canonical outputs or converts unknown authored
data into an isolated, deterministic, deeply frozen `IconDefinition`. It is not a public package
export.

Concrete runtime responsibilities are implemented as classes. `IconDefinitionFactory` composes
normaliser instances through native `#` private fields; normalisers keep supporting behaviour in
private methods rather than loose module functions. The frozen public
[`Icon` API object](../../api/index.md) owns the shared factory instance.
Identity normalisation also serves metadata replacement identities, collection treatment-property
checks and the public property-name operation without depending on definition construction.

## Construction flow

1. `IconDefinitionFactory` returns an exact [recognised output](#recognised-outputs) directly.
   Otherwise it accepts an unknown value and rejects fields outside the closed
   definition shape.
2. `IconIdentityNormaliser` trims and validates the optional namespace and required name and treatment slugs.
3. `IconViewBoxNormaliser` validates finite coordinates and positive dimensions.
4. `IconNodeNormaliser` validates the discriminator, geometry, presentation, cardinality, and
   original paint order of every node.
5. `IconMetadataNormaliser` validates resolved metadata, intrinsic tags, presentation policy,
   licensing relationships, deprecation, and self replacement.
6. Every retained object and sequence on the unknown-input path is newly constructed and frozen
   before the definition is recorded as a canonical output and returned.

The [shared validator](../../shared/index.md#data-acceptance) owns reflective record and array
acceptance. Geometry rules belong to [Node](../../node/index.md), metadata relationships to
[Metadata](../../metadata/index.md), and paint canonicalisation to
[Presentation](../../presentation/index.md). This composition introduces no competing field rules.

## Runtime responsibilities

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconDefinitionFactory` | Recognises its own canonical outputs; otherwise owns the complete validation, normalisation, isolation and deep-freeze transaction. | Composes all definition, node and metadata normalisers. |
| `IconIdentityNormaliser` | Trims and validates complete canonical icon identities; derives variant property names without changing canonical identity. | Reused for owning/replacement identities, public `Icon.variantPropertyName()` and collection property-name checks. |
| `IconViewBoxNormaliser` | Validates finite minima and positive logical dimensions. | Produces the definition coordinate system. |

Primitive assertions and deterministic contract failures are documented by the
[Core shared runtime](../../shared/index.md).

## Error boundary

Invalid ordinary authored data raises the deterministic `IconDefinitionError` documented by the
[Core shared runtime](../../shared/index.md#error). The complete construction transaction terminates
without returning partial data. Caller-controlled execution is distinguished by the
[trust boundary](../../workflow.md#security-and-trust-boundary).

## Identity scope

Core rejects a replacement that points to the definition itself. It deliberately allows separate
definitions with equal identity because it owns no global registry.

Duplicate identities, unavailable replacement targets, and replacement cycles require a complete
catalogue or publication unit and remain responsibilities of the consumer that owns that set.

## Recognised outputs

The factory keeps a private static `WeakSet` shared by its instances within one loaded Core copy.
Only successfully constructed, deeply frozen outputs enter it. Reusing an exact output returns
the same reference without reconstructing its graph, including outputs constructed for collection
membership. This weak membership neither retains definitions nor interns equal logical identities.
It adds no fields, symbols, public operation, global registry or lifecycle API.

Original mutable input, copied/frozen objects, proxy wrappers, decoded JSON and outputs from another
Core copy are unknown references, not necessarily invalid values. Accepting them still requires
complete validation and reconstruction; freezing alone grants no trust. Compatible foreign outputs
remain accepted, but their original references are not adopted into recognition. Repeatedly
submitting that original may repeat the work.

Recognition changes reference reuse, not structural input acceptance or output fields. No timing
or allocation benefit follows from this contract alone; the
[comparison baseline](../../quality-baseline.md) owns measurement evidence. Collection's additional
[retention policy](../../collection/index.md#runtime) remains separate from recognition.

### Reusing definitions

Construct an authored icon once during module initialisation and retain the returned constant.
Export that constant when several modules need the same definition, rather than constructing
independent outputs in each module. The [API usage example](../../api/index.md#usage) supplies
complete authored data; equal logical identities are not interned into a shared object.

Pass the retained output to consumers for repeated use. Inlining
`Svg.render(Icon.define(authoredDefinition))` still constructs an unknown `authoredDefinition`
on every invocation: recognition avoids only the renderer's additional reconstruction. Reusing
the returned definition avoids repeating that initial construction as well. The first construction
is paid once, not eliminated. The consumer must still use the same loaded Core copy to recognise it.

### Preparing external definitions

For a compatible definition received as `externalDefinition`, callers can retain the result of
one explicit construction:

```ts
import { Icon } from "@luscious-garden/aster-core";

const prepared = Icon.define(externalDefinition);
const sameDefinition = Icon.define(prepared) === prepared; // true
```

The initial call still pays complete validation and construction when the input is unknown.
Reusing `prepared` permits recognition by this Core copy; repeatedly passing the original does
not. This is optional preparation, not a new operation or a requirement to accept compatible data.

A downstream consumer benefits only if it uses the same loaded Core copy that constructed
`prepared`. An application-level import is not proof that its renderer resolves that same copy;
calling the producer's Core again does not establish recognition in another copy. Consumers still
accept compatible unknown definitions through full validation. Later changes to mutable original
input require another construction; preparation is an isolated snapshot, not a live input cache.

## Path-command scope

Core validates structured absolute path commands and contour sequencing before construction. It
does not contain an SVG parser, accept textual path syntax or own target-specific serialisation.
External-source ingestion translates accepted syntax into the portable command model before Core
construction.

## Isolation

On the unknown-input path, normalisers retain no caller-owned object or array. Mutating authored
input after construction cannot alter the accepted definition. The result contains plain data
only and remains JSON serialisable.

The accepted output itself is deeply frozen: direct writes to its fields or nested data fail in
ESM strict mode. Assigning another variable to that output preserves its identity and recognition.
A spread copy, clone, wrapper or deserialised value is a different reference, not the original
output losing recognition. Submit changed data through `Icon.define()` to validate and construct
a new recognised output; the unchanged original remains recognised by its constructing Core copy.
