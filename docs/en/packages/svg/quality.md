# SVG Quality

Status: **Accepted**

This document records the accepted observable `@aster/svg` boundary, distribution and consumer
evidence, and the pressures that require new evidence before changing that boundary.
The implemented execution path is documented by [SVG Workflow](workflow.md).

## Public inventory

The package exposes only the root subpath. Its runtime values are:

- `Svg`, a frozen object containing only `render()`;
- `SvgRenderError`, the target-owned programming error class.

Its public type surface comprises:

- `SvgApi`, which declares one explicit definition-to-markup operation;
- `SvgMarkupType`, a named alias for the complete plain string result.

The root intentionally excludes renderer classes, option normalisation, serialisation, schemas,
and the internal render context. Those modules are emitted implementation details but cannot be
resolved through the package export map.

## Runtime inventory

| Responsibility | Current authority | State |
| --- | --- | --- |
| Public composition | Frozen `Svg` object and one stateless `SvgRenderer` instance | Implemented |
| Definition boundary | Public Core `Icon.define()` reconstruction | Implemented |
| Option acceptance | `SvgRenderOptionsNormaliser` and SVG-owned closed field schema | Implemented with exact reflective isolation |
| Render transaction | `SvgRenderer` | Implemented with explicit Core-error translation |
| Markup production | `SvgMarkupSerialiser` and SVG-owned XML character validator | Implemented with exact XML 1.0 conformance |
| Failure identity | Frozen public `SvgRenderError` with static and instance code | Implemented |

The runtime classes are cohesive state-free authorities despite their method counts. Splitting
them, adding base classes, or centralising incidental SVG literals is not justified without a
separate responsibility or demonstrated reuse.

## Consumers

| Consumer | SVG authority used |
| --- | --- |
| Repository authoring workflow | Renders deterministic review and derived distribution markup through `Svg.render()`. |
| Icons documentation | Demonstrates rendering one exported canonical definition. |
| Import adoption workflow | Proves an accepted imported definition renders byte-equivalent markup to its TypeScript-first equivalent. |
| Isolated package consumer | Imports and renders using only publishable Core and SVG files, without repository sources. |
| CLI export | Renders selected icon and collection definitions into complete immutable export plans through the public SVG root. |
| Future review host | Deferred pressure only; no current review product depends on SVG. |

`@aster/cli` depends on the public SVG root for export rendering. `@aster/icons`, `@aster/core`, and
`@aster/import` do not depend on SVG. Import adopts external SVG into portable definitions; this
package renders portable definitions towards SVG markup. Neither direction owns the other.

## Distribution snapshot

The package emits native ES2022 ESM with one public root export and `sideEffects: false`.
The unminified TypeScript distribution contains 19 JavaScript modules totalling 27,315 bytes and
19 declaration files totalling 7,609 bytes. Its sole production dependency is the public
`@aster/core` package root. These values are inspection evidence, not fixed compatibility or
performance promises.

Production compilation excludes DOM, browser, Node, Import, framework, and tooling ambient types.
The ABI suite rejects implementation subpaths, CommonJS output, private Core imports, unexpected
SVG dependencies, and undeclared host authorities. Architecture tooling independently enforces
public visibility, the Core-only production dependency, the root export, portable compilation,
and recognised reverse dependency restrictions.

## Current conformance

Existing runtime evidence covers:

- exact representative standalone markup and stable attribute order;
- opaque path-data serialisation without parser duplication or geometry repair;
- every portable geometry kind and complete presentation output order;
- authorised presentation precedence and hexadecimal paint canonicalisation;
- the complete decorative, labelled, titled, semantic, and conflicting accessibility matrix;
- left-to-right and right-to-left output for Mirror, Preserve, and Manual policies with positive
  and negative view-box minima;
- exact own enumerable option-data acceptance, null-prototype records, and rejection of symbols,
  hidden fields, accessors, inherited state, and unknown fields;
- caller and accepted-definition non-mutation;
- deterministic repeated output;
- exact XML 1.0 code-point acceptance, contextual escaping, invalid-surrogate rejection, and
  source-path failures;
- the complete real Icons corpus under default, semantic, colour-context, viewport, and direction
  scenarios;
- representative malformed definitions, options, conflicts, and target values;
- public error identity, code, path, and message shape.

Type conformance rejects arbitrary attributes, event handlers, explicit undefined option fields,
and DOM ambient values. ABI conformance verifies root values, declarations, exports, dependencies,
side effects, module format, host-independent imports, and loading without repository sources.
Workflow conformance verifies equivalent TypeScript-first and Import-adopted definitions
produce identical standalone markup through public package roots.

## Change pressures

| Pressure | Current evidence | Decision boundary |
| --- | --- | --- |
| API growth | No implemented consumer requires batch, fragment, file, stream, DOM, or extension operations. | Keep `Svg.render()` as the sole operation until a real host workflow proves stable additional semantics. |

These pressures do not permit caches, registries, mutable singletons, trusted definitions,
streaming state, host access, or consumer-specific branches without separate evidence and an
accepted ownership decision.

## Closed public decisions

- Retain the frozen `Svg` object and stateless internal renderer composition; no facade or public
  renderer class owns an additional responsibility.
- Retain `SvgApi` as the explicit structural capability contract used by programmatic hosts and
  type conformance.
- Retain `SvgMarkupType` as the semantic name for one complete plain string result without trusted
  markup, parser, or DOM authority.
- Retain `SvgRenderError` as the public target failure class, expose one frozen static code
  authority consistent with its instance code, and keep implementation subpaths private.
- Translate every public Core `IconDefinitionError` instance regardless of provenance. Preserve
  caller-controlled Proxy, getter, and unrelated execution failures with any other identity.
- Keep `Svg.render()` as the sole API operation because no current consumer demonstrates stable
  semantics for batch, fragment, stream, file, DOM, or target-extension operations.
- Accept only own enumerable string-named data fields from plain option records, snapshot those
  fields before value normalisation, and reject hidden state, symbols, accessors, and inheritance.
- Treat minimum size as icon-owned policy, preserve label precedence over title for accessible
  naming, and generate RTL transforms only for the explicit Mirror-policy combination.
- Validate JavaScript strings by XML 1.0 code point rather than regular-expression code unit,
  preserving valid supplementary values and rejecting isolated surrogates without replacement.
- Keep character acceptance separate from contextual escaping and retain complete markup as the
  only observable success value.
- Retain single-pass attribute escaping because public scenario and CPU-profile evidence identifies
  and removes repeated full-string traversal without changing output bytes or failure semantics.
- Preserve complete Core revalidation, stateless rendering, and allocation without caches or
  trusted-definition shortcuts. The accepted evidence method is the
  [SVG Quality Baseline](quality-baseline.md).

## Accepted boundary

- SVG depends only on the public Core root and owns target conversion only.
- Rendering is synchronous, stateless, and returns one complete string or throws.
- Definitions are revalidated and isolated before target interpretation.
- Options, context, and output remain local to one call.
- Root, geometry, presentation, accessibility, and RTL ordering are deterministic across the
  accepted option matrix.
- The result grants no filesystem, DOM, lifecycle, parsing, or trusted-markup authority.

These guarantees establish the hardened pre-release boundary. Future compatibility policy may
version them more strictly, but no consumer may depend on a broader implicit authority.
