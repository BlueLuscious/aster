# Accessibility and Direction

Status: **Accepted**

This document defines target-independent accessibility intent, conflict handling, and RTL
behaviour. Target adapters map these semantics to their platform without changing them.

## Accessibility intent

An icon is decorative by default. Decorative icons do not expose an accessible name and do not
compete with the label of a surrounding control.

Supplying a `label` or `title` makes the icon semantic unless `decorative` explicitly conflicts
with that content.

| `decorative` | `label` or `title` | Result |
| --- | --- | --- |
| Omitted | Neither supplied | Decorative. |
| `true` | Neither supplied | Decorative. |
| `false` | Neither supplied | Option error because the semantic icon has no accessible name. |
| Omitted | Either supplied | Semantic. |
| `false` | Either supplied | Semantic. |
| `true` | Either supplied | Option error because hidden semantic content is contradictory. |

Empty or whitespace-only labels and titles are invalid. A renderer rejects conflicts rather than
silently discarding accessibility content.

## Label and title responsibilities

`label` is the authoritative accessible name when supplied. `title` requests target-native title
content and acts as the accessible name only when `label` is absent.

Both values may be supplied. In that case:

- `label` remains the only accessible-name authority;
- `title` remains supplementary target-native content;
- an adapter must prevent the title from creating a second announced name.

The generic SVG markup renderer emits:

| Intent | Required output |
| --- | --- |
| Decorative | `aria-hidden="true"` and `focusable="false"`, with no role, label, or title. |
| Semantic with label | `role="img"` and an escaped `aria-label`. |
| Semantic with title only | `role="img"`, an escaped `aria-label` derived from the title, and an escaped first-child `title` element. |
| Semantic with label and title | `role="img"`, `aria-label` from the label, and an escaped first-child `title` element. |

Using `aria-label` avoids generated document identifiers and collisions when the same icon appears
more than once. Attribute order and title placement are deterministic.

Aster cannot detect whether a surrounding button, link, input, or Lotus component already
provides a semantic label. That composition remains the caller's responsibility. An icon inside a
labelled control should ordinarily remain decorative.

## Direction input

`direction` is explicit target-independent render input:

- omitted direction resolves to `ltr`;
- `ltr` and `rtl` are the only portable values;
- the generic renderer never reads ambient DOM, CSS, locale, or process direction.

A framework or DOM adapter may observe a supported ambient direction, but it must resolve that
observation to an explicit portable value before rendering. Server and client adapters must apply
the same rule.

## RTL metadata policies

The definition's portable RTL metadata selects one policy:

| Policy | `ltr` | `rtl` |
| --- | --- | --- |
| Preserve | Preserve geometry. | Preserve geometry. |
| Mirror | Preserve geometry. | Mirror geometry horizontally. |
| Manual | Preserve the selected definition. | Preserve the selected definition. |

`Manual` means that the application or semantic UI layer selects the appropriate definition or
variant. A renderer does not infer that choice from icon name or category.

For `Mirror` in RTL, the SVG renderer wraps geometry in one generated group and reflects it about
the vertical centre of the viewBox. Given `minX` and `width`, the equivalent matrix is:

```text
matrix(-1 0 0 1 (2 * minX + width) 0)
```

The generated transformation belongs to the render result. It does not mutate nodes and does not
relax the prohibition on transforms in canonical SVG input.

Accessibility title content remains outside the mirrored geometry group. Mirroring preserves node
order, fill, stroke width, opacity, and canonical identity.

## Target conformance

Every target adapter must prove:

- decorative output is absent from its accessibility tree;
- semantic output has exactly one effective accessible name;
- invalid intent combinations fail consistently;
- Preserve, Mirror, and Manual policies match portable semantics;
- generic and named APIs produce equivalent accessibility and direction results;
- rendering never mutates the definition.

A target that cannot represent an accepted semantic must reject the operation explicitly rather
than approximate it silently.
