# Aster Pilot Reference Set

Status: **Experimental**

The pilot contains sixteen canonical definitions in
[`@aster/icons`](../../packages/icons/index.md). It deliberately covers common interface
metaphors and difficult construction roles before any catalogue growth is accepted.

## Coverage

| Construction concern | Evidence |
| --- | --- |
| Horizontal and vertical axes | `plus`, `home`, `lock`, and `settings`. |
| Diagonals | `arrow-left`, `check`, `close`, `search`, and `star`. |
| Geometric curves | `search`, `user`, `camera`, `settings`, and `lock`. |
| Organic curves | `heart`, `cloud`, and `leaf`. |
| Symmetry | `close`, `plus`, `home`, `user`, `settings`, `lock`, and `star`. |
| Asymmetry | `arrow-left`, `check`, `camera`, `folder`, `cloud`, and `leaf`. |
| Negative space | `home`, `user`, `camera`, `settings`, and `lock`. |
| Detached detail | `bell`. |
| Complexity pressure | `settings`, `star`, and `camera`. |
| Directional behaviour | `arrow-left`. |

## Initial Rule Findings

The complete set shares the `0 0 24 24` viewBox, `1.5` scalable stroke, round cap and join,
half-unit construction grid, ISC licence, and BlueLuscious attribution without an exception.

The initial structural checks establish:

- all sixteen identities are unique;
- every definition uses between one and ten geometry primitives;
- `settings` remains below the sixteen-primitive advisory limit while exposing radial-detail
  pressure;
- all explicit geometry values follow the provisional `0.5` subdivision;
- no node requires a secondary stroke, fill, or presentation override;
- every icon produces distinct deterministic SVG at both `16px` and `24px`;
- `arrow-left` is the only subject requiring automatic RTL mirroring.

Initial visual review moved the `bell` clapper guide from `y = 21` to `y = 20` after the larger
gap made the detail read as an unrelated dash. The correction was made in the canonical
TypeScript module and retained the half-unit grid and nominal safe area.

The reproducible [pilot review evidence](review-evidence.md) confirms zero blocking or advisory
findings against the currently defined technical thresholds. These findings support retaining the
provisional values for curatorial review. They do not yet promote safe-area, occupied-area,
optical, curve-quality, or minimum-size hypotheses to stable rules.

## Semantic Adjacency

The initial adjacent-subject review checks these potentially confusing pairs:

| Pair | Required distinction |
| --- | --- |
| `plus` and `close` | Orthogonal versus diagonal construction. |
| `search` and `settings` | Handle-directed action versus radial mechanical detail. |
| `heart` and `star` | Continuous organic contour versus repeated geometric points. |
| `home` and `folder` | Centred roof and doorway versus asymmetric tabbed container. |
| `bell` and `cloud` | Detached clapper and vertical enclosure versus continuous horizontal organic silhouette. |

Distinct markup proves structural uniqueness, not semantic recognisability. Human review at
minimum size remains required before the pilot is approved.

## Provenance And Licence

The pilot definitions are original Aster artwork curated and authored by BlueLuscious. Their
effective artwork licence is ISC. No third-party source, Illustrator master, imported SVG, or
generated definition is canonical for this set.

The authoritative source for each icon is its TypeScript module in `@aster/icons`. SVG rendered
through `@aster/svg` is disposable review evidence and is not persistent distribution output.
