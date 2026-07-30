# SVG Render Result

Status: **Experimental**

The render feature defines the output produced by successful framework-independent SVG rendering.

## Type

| Type | Representation | Responsibility |
| --- | --- | --- |
| `SvgMarkupType` | `string` | Represents one complete standalone `<svg>` value returned atomically. |

The string includes the SVG root and namespace but no XML declaration. It remains portable across
server rendering, static generation, streams, tests, browser hosts, and future file exporters.
It grants no DOM insertion or trusted-markup authority.

Equivalent accepted definitions, options, and renderer versions must produce byte-equivalent
markup. Exact root, node, presentation, accessibility, direction, numeric, attribute-order, and
escaping rules are owned by Aster rather than by ambient platform behaviour.

## Document form

The initial renderer emits:

- one compact `<svg>...</svg>` string;
- no XML declaration, indentation, trailing newline, comments, or editor metadata;
- double-quoted attributes;
- explicit closing syntax for the root, `title`, and generated RTL group;
- compact self-closing syntax such as `<path d="..."/>` for geometry.

The root attribute order is:

1. `xmlns`;
2. `viewBox`;
3. `width`;
4. `height`;
5. optional `color`;
6. accessibility attributes;
7. no arbitrary target extension.

Decorative accessibility attributes are ordered as `aria-hidden`, then `focusable`. Semantic
attributes are ordered as `role`, then `aria-label`. An optional `title` is the first child and
always remains outside a generated RTL geometry group.

## Geometry mapping

Portable nodes map directly and retain paint order:

| Portable kind | Element | Geometry attribute order |
| --- | --- | --- |
| `path` | `path` | `d` |
| `circle` | `circle` | `cx`, `cy`, `r` |
| `ellipse` | `ellipse` | `cx`, `cy`, `rx`, `ry` |
| `rect` | `rect` | `x`, `y`, `width`, `height`, optional `rx`, optional `ry` |
| `line` | `line` | `x1`, `y1`, `x2`, `y2` |
| `polyline` | `polyline` | `points` |
| `polygon` | `polygon` | `points` |

Presentation follows geometry attributes in this order:

1. `fill`;
2. `fill-rule`;
3. `stroke`;
4. `stroke-width`;
5. `stroke-linecap`;
6. `stroke-linejoin`;
7. `stroke-miterlimit`;
8. `opacity`;
9. `fill-opacity`;
10. `stroke-opacity`.

The renderer resolves technical defaults, collection defaults, node presentation, and authorised
caller overrides before serialising each node. Caller overrides therefore remain authoritative
even when a node contains an explicit value. The root does not rely on inherited fill or stroke
to approximate this precedence.

## Numeric and text form

Finite numbers use locale-independent ECMAScript string form after canonicalising negative zero
to zero. Coordinate sequences use one ASCII space between numbers. `viewBox` follows the same
four-number form.

Attribute text escapes ampersand, less-than, greater-than, and double-quote characters. `title`
text escapes ampersand, less-than, and greater-than characters. Invalid controls and malformed
option text fail before any markup is returned.

## Viewport and colour

Viewport size resolves from explicit `size`, collection `defaultSize`, or viewBox dimensions in
that order. An explicit size below collection `minimumSize` is rejected rather than presented as
curator-approved output.

The portable `colour` option maps to the root SVG `color` attribute. SVG paint `none` cannot
represent a colour context and is rejected when supplied as `colour`; it remains valid for fill
and stroke. The externally defined spellings `color` and `currentColor` remain exact.

## Direction

Mirror-policy geometry rendered in right-to-left direction is wrapped once:

```text
<g transform="matrix(-1 0 0 1 T 0)">...</g>
```

`T` is the canonical numeric result of `2 * minX + width`. Preserve and Manual policies emit no
generated transform.
