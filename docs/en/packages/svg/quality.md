# SVG Quality

Status: **Under Audit**

This document inventories the observable `@aster/svg` boundary, current distribution and consumer
evidence, and unresolved pressures that must be closed before the package is accepted as hardened.
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
| Option acceptance | `SvgRenderOptionsNormaliser` and SVG-owned closed field schema | Implemented, exact reflective shape under audit |
| Render transaction | `SvgRenderer` | Implemented, failure classification under audit |
| Markup production | `SvgMarkupSerialiser` and SVG-owned character schema | Implemented, XML repertoire under audit |
| Failure identity | Public `SvgRenderError` | Implemented, translation boundary under audit |

The runtime classes are cohesive state-free authorities despite their method counts. Splitting
them, adding base classes, or centralising incidental SVG literals is not justified without a
separate responsibility or demonstrated reuse.

## Consumers

| Consumer | SVG authority used |
| --- | --- |
| Repository authoring workflow | Renders deterministic review and derived distribution markup through `Svg.render()`. |
| Icons documentation | Demonstrates rendering one exported canonical definition. |
| Future CLI export or review host | Deferred pressure only; no current CLI production dependency exists. |

`@aster/icons`, `@aster/core`, `@aster/build`, and `@aster/cli` do not depend on SVG. Build imports
external SVG towards portable definitions; this package renders portable definitions towards SVG
markup. Neither direction owns the other.

## Distribution snapshot

The current package emits native ES2022 ESM with one public root export and `sideEffects: false`.
The unminified TypeScript distribution contains 18 JavaScript modules totalling 23,206 bytes and
18 declaration files totalling 6,262 bytes. Its sole production dependency is the public
`@aster/core` package root. These values are inspection evidence, not fixed compatibility or
performance promises.

Production compilation excludes DOM, browser, Node, Build, framework, and tooling ambient types.
The ABI suite rejects implementation subpaths, CommonJS output, private Core imports, reverse
package dependencies, and undeclared host authorities.

## Current conformance

Existing runtime evidence covers:

- exact representative standalone markup and stable attribute order;
- every portable geometry kind and complete presentation output order;
- authorised presentation precedence and hexadecimal paint canonicalisation;
- decorative and semantic representative output;
- one mirrored right-to-left result with title placement;
- caller and accepted-definition non-mutation;
- deterministic repeated output;
- representative malformed definitions, options, conflicts, and target values;
- public error identity, code, path, and message shape.

Type conformance rejects arbitrary attributes, event handlers, explicit undefined option fields,
and DOM ambient values. ABI conformance verifies root values, declarations, exports, dependencies,
side effects, module format, and host-independent imports.

## Audit pressures

| Pressure | Current evidence | Decision boundary |
| --- | --- | --- |
| Exact option shape | A non-enumerable known field can influence output, a symbol field is ignored, and an accessor-owned known field executes during normalisation. | Align option-shape semantics with the deliberate SVG boundary; reject unsupported reflective state before reading accepted values. |
| Failure classification | `SvgRenderer` converts every exception from Core reconstruction into `SvgRenderError`, including caller-controlled Proxy failures. | Translate only failures whose invariant SVG deliberately owns; preserve unrelated execution identity without native-message leakage. |
| XML character repertoire | The current pattern rejects `U+007F`, which XML 1.0 permits, while allowing `U+FFFF` and isolated UTF-16 surrogates into output. | Define the exact XML 1.0 character set for JavaScript strings and reject invalid code points before returning markup. |
| Diagnostic vocabulary | Minimum-size rejection currently refers to a collection minimum although the policy belongs to the icon definition. | Use stable target-owned language that identifies the correct domain authority. |
| Accessibility matrix | Representative decorative, labelled, titled, and mirrored output exists, but the complete conflict and policy matrix is not yet explicit. | Prove every accepted combination and its exact output before declaring the behaviour hardened. |
| Output corpus | Every primitive has one golden test, while the complete real Icons corpus is not yet rendered as SVG package conformance. | Add corpus-level deterministic evidence without assigning catalogue ownership to SVG. |
| Performance | No SVG-specific scenario matrix, CPU attribution, allocation comparison, or accepted baseline exists. | Measure only after correctness closes; optimise one attributed mechanism at a time under repository comparison rules. |
| API growth | No implemented consumer requires batch, fragment, file, stream, DOM, or extension operations. | Keep `Svg.render()` as the sole operation until a real host workflow proves stable additional semantics. |

These pressures are bounded audit work, not permission to introduce caches, registries, mutable
singletons, trusted definitions, streaming state, host access, or consumer-specific branches.

## Accepted starting boundary

- SVG depends only on the public Core root and owns target conversion only.
- Rendering is synchronous, stateless, and returns one complete string or throws.
- Definitions are revalidated and isolated before target interpretation.
- Options, context, and output remain local to one call.
- Root, geometry, presentation, accessibility, and RTL ordering are deterministic where currently
  covered.
- The result grants no filesystem, DOM, lifecycle, parsing, or trusted-markup authority.

These statements describe the current starting boundary. The package remains experimental until
the audit pressures are corrected, accepted, or explicitly deferred with conformance evidence.
