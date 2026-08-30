# Aster Collection Design Contract

Status: **Provisional**

This contract defines testable visual hypotheses for the Experimental `aster` collection. It does
not define universal Aster project constraints. Values become stable collection rules only after
the representative set demonstrates consistent construction and legibility.

## Personality

The collection uses geometric outline construction with restrained optical correction. Its forms
should appear deliberate, calm, and recognisable rather than decorative or diagrammatically
literal.

Geometry supplies the starting structure. Curatorial review may adjust mathematical centring,
symmetry, and guide alignment when the uncorrected result appears visually displaced.

## Coordinate System

| Property | Provisional value | Authority | Inconsistency prevented |
| --- | --- | --- | --- |
| `viewBox` | `0 0 24 24` | Strict | Mixed coordinate systems producing incomparable scale and padding. |
| Base grid | `1` unit | Construction guide | Unrelated anchor rhythms between icons. |
| Subdivision | `0.5` unit | Automated advisory | Arbitrary fractional coordinates without optical intent. |
| Key axes | `x = 12`, `y = 12` | Construction guide | Accidental displacement of nominally centred forms. |
| Nominal safe area | `2 2 2 2` insets | Automated advisory | Icons filling materially different proportions of the viewport. |

Primary structural anchors use whole units where practical. Half-unit anchors are normal for
stroke alignment, optical balance, and tangent construction. Other fractions require an optical
reason visible in review.

The nominal safe area spans `x = 2..22` and `y = 2..22`. It is a comparison guide, not a clipping
boundary. Curves and pointed forms may overshoot a safe guide by at most `0.5` unit when that
correction makes their apparent bounds agree with flat forms. Visible geometry must remain inside
the viewBox.

## Stroke And Presentation

| Property | Provisional value | Authority | Inconsistency prevented |
| --- | --- | --- | --- |
| Source stroke width | `1.5` units | Strict | Uneven visual weight within the base family. |
| Stroke scaling | Scalable with geometry | Strict | Size-dependent weight behaviour that portable renderers cannot reproduce consistently. |
| Line cap | `round` | Strict for open strokes | Mixed terminal language. |
| Line join | `round` | Strict for stroked corners | Unrelated corner sharpness and miter protrusions. |
| Secondary stroke widths | None | Strict | Detail hierarchy emerging without a collection-level variant or weight policy. |
| Fill | `none` | Strict default | Accidental mixing of outline and filled visual families. |
| Stroke paint | SVG `currentColor` | Strict default | Embedded colours preventing host-controlled presentation. |

The portable presentation defaults are therefore equivalent to:

```ts
{
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLineCap: "round",
  strokeLineJoin: "round",
}
```

The collection initially grants no fill, stroke, or stroke-width override capability. Hosts
control colour through `currentColor`, while preserving the collection's authored paint and
weight relationship.

## Form Language

### Corners And Angles

Structural forms prefer horizontal, vertical, `45`-degree, and geometrically necessary diagonal
directions. Round joins provide the common corner treatment; geometry should not add decorative
rounding merely to soften a form.

An uncommon angle is accepted when the metaphor or optical balance requires it. Repeated related
angles within one icon should share a clear construction relationship.

### Curves

Circles, ellipses, and tangent-continuous curves are preferred over unrelated Bezier handles.
Curve transitions should not introduce visible flats, cusps, or uneven tension at the default
size. Organic metaphors may depart from circular geometry when the departure is systematic and
reviewed.

### Symmetry And Perspective

Neutral subjects begin from geometric symmetry. Directional, organic, and perspective-sensitive
subjects may be optically asymmetric, but accidental asymmetry is not a style feature.

Subjects use frontal or orthographic construction. A single restrained depth cue is permitted
when a flat silhouette would make the metaphor ambiguous. Pictorial perspective, shading, and
three-dimensional illustration are excluded.

### Negative Space And Detail

Distinct internal contours should normally retain at least `1.5` units of clear separation before
stroke expansion. Small gaps, isolated marks, and short segments must remain distinguishable at
`16px`.

The provisional advisory complexity budget is:

| Metric | Limit | Inconsistency prevented |
| --- | --- | --- |
| Geometry primitives | `16` | One subject becoming materially more illustrative than its peers. |
| Explicit path commands | `64` | Unreviewable path complexity and accidental export noise. |

Complexity limits trigger review rather than automatic rejection. A simpler form is preferred
when it preserves the same recognisable metaphor.

## Display Sizes

The default square display size is `24`. The curator-approved minimum candidate is `16`.

Every reference icon is reviewed at both sizes. Geometry is not redesigned automatically for the
minimum size; if repeated evidence shows that one scalable definition cannot remain legible,
size-specific variants require a separate collection decision.

## Reference Roles

The pilot uses these icon roles to test the contract:

| Icon identity | Primary evidence |
| --- | --- |
| `arrow-left` | Diagonal rhythm, open terminals, directionality, and optical centring. |
| `search` | Circular geometry, tangent transition, and mixed curve-line balance. |
| `home` | Symmetry, preferred angles, structural joins, and negative space. |
| `user` | Nested curves, circular proportion, and minimum-size separation. |
| `heart` | Organic curves and optical rather than purely mathematical balance. |
| `settings` | Detail and complexity limits under a familiar metaphor. |

Additional pilot subjects may broaden coverage, but they do not replace these roles without a
curatorial record.

## Enforcement Map

Current package tests enforce unique identities, the `0 0 24 24` viewBox, shared `1.5` stroke
policy, round caps and joins, no node-specific presentation, a maximum of sixteen primitives,
half-unit geometry, effective ISC licensing, attribution, deep immutability and the accepted RTL
policy. Workflow tests prove deterministic review SVG, editable SVG adoption and correction in the
canonical TypeScript source.

The repository has no generic collection-validation schema or configurable design-rule engine.
The nominal safe area, path-command budget, negative space, curve quality, recognisability and
visual balance remain documented advisory or curatorial checks. A future automation capability
must implement and test its own exact severity and evidence contract before this document can
claim machine enforcement.

## Exceptions

An exception records:

- the fully qualified icon identity;
- the rule or guide being crossed;
- the visual or semantic reason;
- evidence at `16px` and `24px`;
- curator approval;
- whether the exception suggests a future contract change.

An exception changes one icon, not the collection rule. Repeated equivalent exceptions require a
contract review rather than copied waivers.

Exception storage follows the canonical authoring boundary selected by the collection. Until that
boundary exists, exceptions may be evaluated during experimentation but cannot authorise
distributed icon sources.
