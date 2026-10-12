# SVG Render Result

Status: **Accepted**

The render feature defines the output produced by successful framework-independent SVG rendering.
Its [runtime composition](runtime/index.md) validates the complete input before returning markup.

## Type

| Type | Representation | Responsibility |
| --- | --- | --- |
| `SvgMarkupType` | `string` | Represents one complete standalone `<svg>` value returned atomically. |

The string includes the SVG root and namespace but no XML declaration. It remains portable across
server rendering, static generation, streams, tests, browser hosts, and future file exporters.
It is the result contract used by `SvgApi` and the private serialiser; hosts can retain or transmit
the string, but it grants no DOM insertion or trusted-markup authority.

Equivalent accepted definitions, options, and renderer versions must produce byte-equivalent
markup. Exact root, node, presentation, accessibility, direction, numeric, attribute-order, and
escaping rules are owned by Aster rather than by ambient platform behaviour.

## Document form

The renderer emits:

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
6. fixed `data-rendered-by="Aster"`;
7. accessibility attributes;
8. no arbitrary target extension.

The fixed data attribute identifies Aster as the renderer, not the author of the artwork. It
appears on every successfully rendered root, regardless of the icon's identity or collection.
This marker is informational: a consumer can remove it and an optimiser may strip it. It does
not replace applicable licence or credit requirements.

Accessibility intent and label/title precedence follow
[Core Render Options](../../core/render/index.md#option-semantics). SVG maps decorative output to
`aria-hidden="true"`, then `focusable="false"`; semantic output uses `role="img"`, then
`aria-label` with the resolved accessible name. An optional escaped `title` is the first child
and always remains outside a generated RTL geometry group. Accepted option text is trimmed and
must remain non-empty and representable under the XML rules below.

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

Path nodes carry Core-owned structured commands. SVG maps them to uppercase absolute command
letters, expands every operation, separates letters and operands with one ASCII space, writes arc
flags as `0` or `1`, and separates command groups with one ASCII space. It does not parse source
path syntax, resolve relative coordinates or implement shorthand rules. Those source concerns
belong to Import; the portable ownership boundary is defined by
[Core Node](../../core/node/index.md).

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

Each node uses Core's [presentation precedence](../../core/presentation/index.md#resolution-precedence).
All ten effective fields, including values equal to the
[technical defaults](../../core/presentation/index.md#technical-defaults), are emitted in the order
above. The root does not rely on
inherited fill or stroke to approximate this resolution.

## Numeric and text form

Finite numbers use locale-independent ECMAScript string form after canonicalising negative zero
to zero. Path operands, point sequences and `viewBox` coordinates use one ASCII space between
numbers.

The accepted XML 1.0 character repertoire is exactly tab, line feed, carriage return,
`U+0020-U+D7FF`, `U+E000-U+FFFD`, and `U+10000-U+10FFFF`. Valid supplementary characters and XML
noncharacters inside those ranges are preserved. Unsupported controls, isolated UTF-16
surrogates, `U+FFFE`, and `U+FFFF` fail at their logical source path before markup is returned.

Attribute text escapes ampersand, less-than, greater-than, and double-quote characters. Tabs, line
feeds, and carriage returns in attributes use `&#9;`, `&#10;`, and `&#13;` respectively. `title`
text escapes ampersand, less-than, and greater-than characters while retaining quotes and accepted
XML whitespace as authored after option trimming.

Serialisation uses ECMAScript code-point iteration and string conversion without a locale, DOM,
XML parser, stream, or platform encoder. An invalid value can discard only local intermediate
strings; no partial result or external target exists before the complete return value.

## Viewport and colour

Width and height follow the [portable viewport rules](../../core/render/index.md#option-semantics).
A resolved square size produces equal root dimensions; otherwise each viewBox dimension is used.

The portable `colour` option maps to the root SVG `color` attribute. SVG paint `none` cannot
represent a colour context and is rejected when supplied as `colour`; it remains valid for fill
and stroke. The externally defined spellings `color` and `currentColor` remain exact.

## Direction

Mirror-policy geometry rendered in right-to-left direction is wrapped once:

```text
<g transform="matrix(-1 0 0 1 T 0)">...</g>
```

`T` is the canonical numeric result of `2 * minX + width`, including view boxes with positive or
negative minima. When an intermediate operation overflows but `T` remains representable, the
renderer uses equivalent arithmetic to recover it. If `T` cannot be represented as a finite number,
rendering raises `SvgRenderError` at `definition.viewBox` rather than emitting `Infinity`.
Mirroring occurs only for explicit right-to-left direction under the Mirror policy. Left-to-right
output and the Preserve and Manual policies emit no generated transform.
