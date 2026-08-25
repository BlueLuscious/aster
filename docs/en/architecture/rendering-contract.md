# Rendering Contract

Status: **Accepted**

This document defines renderer authority, target-independent options, presentation precedence, and
Aster's first concrete rendering result. Accessibility and direction are defined separately in
[Accessibility and Direction](accessibility-and-direction.md).

## Renderer authority

A renderer converts one validated portable icon definition and one validated option value into a
target-specific result. It may:

- select target syntax for every accepted portable node;
- apply resolved presentation and caller options;
- apply accessibility and directional behaviour;
- escape target text and attribute values;
- reject options that cannot be represented safely.

A renderer cannot mutate a definition, infer application semantics, repair invalid geometry,
traverse a global registry, or reinterpret icon presentation policy.

## Public object API

The framework-independent SVG package exposes one immutable `Svg` API object:

```ts
const markup = Svg.render(Camera, options);
```

`Svg.render()` receives the definition explicitly and returns one complete SVG markup string. It
does not mount content or retain lifecycle state.

The package exposes no generated named wrapper. A future target integration may close over
one definition, but it must delegate to `Svg.render()` and requires independent package and
consumer evidence.

Framework adapters may express rendering through their native component syntax. Given the same
definition, options, and target semantics, an adapter must preserve the accepted presentation,
accessibility, direction, and failure behaviour.

## Target-independent options

The portable `IconRenderOptions` value is a read-only closed object:

| Field | Meaning |
| --- | --- |
| `size` | Optional positive finite square viewport size in target-independent logical units. |
| `colour` | Optional portable paint value used to resolve `currentColor`. |
| `fill` | Optional fill override when permitted by the icon's presentation policy. |
| `stroke` | Optional stroke override when permitted by the icon's presentation policy. |
| `strokeWidth` | Optional non-negative finite width override in viewBox units when permitted by the icon's presentation policy. |
| `label` | Optional non-empty accessible name. |
| `title` | Optional non-empty target-native title and fallback accessible name. |
| `decorative` | Optional explicit accessibility intent. |
| `direction` | Optional explicit `ltr` or `rtl` rendering direction. |

An option value never selects an icon variant. A variant has distinct canonical identity and is
selected by passing its definition.

The portable options contain no DOM node, CSS declaration, class name, identifier, event handler,
framework controller, or lifecycle value. Invalid fields or values fail before output is returned.
Caller-option failures use the target renderer's documented programming-error boundary rather
than source diagnostics.

## Target extensions

A target renderer may define a separate extension object for capabilities that have no portable
meaning. An extension must:

- remain in the target package;
- use a closed allow-list;
- preserve portable field meanings and precedence;
- avoid changing identity, geometry, node order, or icon presentation policy;
- preserve the accepted accessibility and direction contract;
- validate and escape every accepted target value.

Target extensions cannot use structural typing to make arbitrary platform attributes appear
portable. Attributes such as DOM classes, data attributes, or event listeners require an explicit
DOM-specific contract and are not part of the first SVG markup renderer.

## Presentation precedence

Effective presentation is resolved in this ascending order:

1. documented portable technical defaults;
2. presentation defaults stored by the icon;
3. explicit presentation stored on each portable node;
4. explicit caller overrides allowed by the icon's presentation policy.

Later values override earlier values only for the same capability. The `colour` option supplies
the rendering context for `currentColor`; it does not replace literal node fill or stroke paint.

Icon metadata declares which of `fill`, `stroke`, and `strokeWidth` callers may override. A
disallowed override is an option error, not a value to ignore. Collection-authored defaults may
enter an icon during an explicit import flow, but the resulting portable definition owns its
resolved policy independently of collection membership.

Effective viewport dimensions resolve as follows:

1. explicit `size` sets equal width and height;
2. otherwise, icon `defaultSize` sets equal width and height;
3. otherwise, viewBox width and height become viewport width and height respectively.

An explicit size below icon `minimumSize` is an option error. The renderer does not describe
output below that threshold as author-approved.

The viewBox itself cannot be overridden. The SVG renderer always emits explicit numeric width and
height and never relies on a browser's implicit SVG viewport.

When `colour` is omitted, the SVG target emits no external `color` attribute and allows the exact
SVG token `currentColor` to inherit from its host. A supplied `colour` maps to a validated external
`color` value without replacing literal node paint. Portable paint `none` remains valid for fill
and stroke but is an option error when supplied as the external colour context.

Stroke widths use viewBox units and scale with geometry when `size` changes. Constant device-pixel
strokes are target-specific behaviour and are not part of the portable options.

The renderer never rewrites the definition to apply effective presentation. Resolution exists
only for the current render operation.

## SVG result

The generic SVG renderer returns a complete standalone `<svg>` markup string. The result:

- includes the accepted viewBox and SVG namespace;
- sets explicit numeric width and height from the effective viewport;
- emits nodes in portable paint order;
- uses deterministic element and attribute ordering;
- escapes text and attribute values;
- carries no DOM, `TrustedHTML`, framework, browser, or Node object.

Markup is returned as a string because it is portable across server rendering, static generation,
tests, streams, and browser hosts. A browser consumer remains responsible for its own insertion or
parsing boundary. Aster does not claim that a plain string bypasses host security policy.

The result is produced atomically: a successful call returns the complete string, and a failed
call returns no partial markup.

## Determinism

Rendering the same immutable definition and option values with the same renderer version produces
the same string. Output cannot depend on locale, ambient text direction, process state, DOM state,
object insertion order from uncontrolled input, or current time.

Element, attribute, presentation, numeric, escaping, and accessibility ordering are part of SVG
renderer conformance. They do not alter the byte-generation rules defined in
[Diagnostics and Determinism](diagnostics-and-determinism.md).
