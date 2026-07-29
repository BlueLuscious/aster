# Experimental Provisional Design Contract

Status: **Provisional**

This contract supplies testable hypotheses for the experimental collection. Passing its automated
checks demonstrates technical consistency only; it does not establish a mature visual language.

## Collection hypotheses

| Property | Provisional value |
| --- | --- |
| `viewBox` | `0 0 24 24` |
| Base grid step | `0.5` |
| Nominal safe-area inset | `2` units on every side |
| Default display size | `24` |
| Minimum display size | `16` |
| Source stroke width | `1` |
| Presentation defaults | No fill, `currentColor` stroke, stroke width `1` |
| Caller overrides | Stroke and stroke width |
| Complexity | At most four primitives and twelve authored path commands |

All automated visual-rule findings remain warnings. The collection has insufficient evidence to
make grid, safe area, stroke, or complexity drift a blocking artistic failure.

## Visual direction

The three spike icons favour simple geometry, centred construction, restrained detail, and
recognisable silhouettes. This direction exists only to make comparisons possible. It does not
define Aster globally and may be replaced incompatibly while the collection remains Experimental.

The current source set deliberately covers straight segments, curves, closed paths, fractional
coordinates, rounded rectangles, repeated point sequences, and overlapping primitives. It does
not yet provide evidence for perspective, optical overshoot, multiple stroke weights, filled and
outlined variants, or manual right-to-left artwork.

## Review boundary

Technical validation can report source drift against these hypotheses. Human review remains
authoritative for recognisability, balance, visual weight, semantic clarity, cleanliness, and
artistic coherence.
