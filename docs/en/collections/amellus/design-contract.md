# Amellus Visual Design Contract

Status: **Accepted for initial authorship**

This contract defines the visual language for the first Amellus inventory. It governs collection
membership rather than all Aster icons: an independently authored icon may exist outside Amellus
or follow another collection's accepted language.

## Character

Amellus uses a restrained geometric outline language for common application interfaces. Forms
must remain calm, direct and recognisable at small sizes. Geometry provides the construction
baseline, while documented optical correction may take precedence over mathematical centring.

The collection favours familiar metaphors, low detail and consistent negative space. It excludes
decorative embellishment, pictorial perspective, shading and collection-specific branding.

## Coordinate system

| Property | Accepted rule |
| --- | --- |
| View box | `0 0 24 24` |
| Base grid | `1` logical unit |
| Normal subdivision | `0.5` logical unit |
| Key axes | `x = 12` and `y = 12` |
| Nominal safe area | `x = 2..22` and `y = 2..22` |

Primary anchors should use whole units. Half units are accepted for stroke alignment, tangencies
and optical balance. Finer values require a visible geometric reason and explicit curatorial
review; they must not result from unclean editor export data.

The safe area is a comparison guide rather than a clipping boundary. Curves, points and diagonal
terminals may overshoot it by at most `0.5` unit when this makes their apparent bounds agree with
flat forms. All visible geometry must remain inside the view box after stroke expansion.

## Presentation

Every initial Amellus icon uses one scalable outline weight:

```ts
{
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLineCap: "round",
  strokeLineJoin: "round",
}
```

The following policies apply:

- `currentColor` is the only authored visible paint, allowing the host to provide colour without
  coupling definitions to a target renderer;
- filled, duotone, shaded and multi-weight forms are excluded from the initial collection;
- node-specific presentation is excluded unless a later reviewed exception proves it necessary;
- fill, stroke and stroke-width overrides are not granted by the initial collection;
- stroke scales with the view box and is never defined as a constant device-pixel width;
- `nonzero` remains the implicit fill rule where closed geometry requires a technical default.

These rules are expressible through the existing Core presentation contract and render
deterministically through SVG. The external spellings `currentColor` and `color` remain unchanged
because they belong to SVG and CSS rather than Aster's prose vocabulary.

## Form language

### Lines, corners and curves

Horizontal, vertical and `45`-degree directions are preferred where the metaphor permits them.
Other diagonals must follow a repeatable geometric relationship. Round caps govern open terminals,
and round joins govern stroked corners; geometry must not add ornamental rounding merely to soften
a shape.

Circles, ellipses and tangent-continuous curves are preferred over unrelated Bezier handles.
Organic subjects may depart from circular construction when their curves remain deliberate,
balanced and free from visible flats, cusps or uneven tension at `24px` and `16px`.

Neutral subjects begin from geometric symmetry. Directional, organic and perspective-sensitive
subjects may use restrained optical asymmetry. Frontal and orthographic construction is the
default; one shallow depth cue is accepted only when a flat form would be ambiguous.

### Spacing and detail

Distinct contours should normally retain at least `1.5` logical units of clear separation before
stroke expansion. Detached marks and short segments must remain visibly associated with their
subject at `16px`. A gap that closes, a mark that resembles noise or two contours that merge at
that size requires simplification or rejection.

An icon should use no more than `16` geometry primitives or `64` explicit path commands. These are
review thresholds, not permission to consume the full budget. The simplest recognisable geometry
is preferred, and repeated pressure against either threshold requires reconsidering the metaphor.

## Display sizes

The canonical display size is `24px`; the accepted minimum is `16px`. The same scalable definition
must remain recognisable at both sizes. Amellus does not initially support size-specific geometry,
and a candidate that requires it is removed or deferred rather than silently introducing a
variant system.

Review at both sizes covers apparent bounds, stroke weight, negative space, detached detail and
semantic recognition. Larger previews may expose curve defects but cannot compensate for failure
at the minimum size.

## Direction and RTL

Icons preserve authored geometry unless their meaning represents logical horizontal movement.
`arrow-left` and `arrow-right` use the Core `mirror` policy so their semantic previous and next
roles follow explicit rendering direction. Their names describe canonical authored geometry;
mirroring does not create another identity.

All other initial icons use `preserve`. Amellus accepts no initial `manual` icon because no
candidate requires a separately authored RTL definition. Vertical movement, text-independent
status and object orientation must not mirror merely because the surrounding interface is RTL.

## Optical review

Grid compliance is a construction aid, not proof of visual balance. Curatorial review may approve
small corrections for pointed shapes, circular forms, asymmetric mass or diagonal intersections.
Each exception must identify the icon, affected rule, visible reason, `16px` and `24px` evidence,
and curator decision. Repeated equivalent exceptions trigger review of this contract rather than
copied waivers.

The representative stress set is defined in the [initial inventory](inventory.md). It must cover
curves, diagonals, symmetry, enclosures, detached details and mixed primitives before the visual
language can be promoted beyond initial authorship.
