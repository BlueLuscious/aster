# Aster Pilot Reference Set

Status: **Experimental**

The pilot retains seven canonical definitions in
[`@aster/icons`](../../packages/icons/index.md). It provides a small primitive-first reference set
while nine former path-authored definitions await reauthoring for Amellus.

## Coverage

| Construction concern | Evidence |
| --- | --- |
| Horizontal and vertical axes | `plus` and `settings`. |
| Diagonals | `arrow-left`, `check`, `close`, and `star`. |
| Geometric curves | `search` and `settings`. |
| Symmetry | `close`, `plus`, `settings`, and `star`. |
| Asymmetry | `arrow-left` and `check`. |
| Negative space | `search` and `settings`. |
| Complexity pressure | `settings` and `star`. |
| Directional behaviour | `arrow-left`. |

The retained set shares the `0 0 24 24` view box, `1.5` scalable stroke, round cap and join,
half-unit construction grid, ISC licence, and BlueLuscious attribution without an exception. It
uses only circle, line, polygon and polyline nodes.

Current package and workflow conformance confirms unique identities, shared authored defaults,
explicit collection membership, deterministic rendering, and distinct output at the tested sizes.
These checks do not promote safe-area, occupied-area, optical, curve-quality or minimum-size
hypotheses to stable rules.

## Deferred concepts

`bell`, `camera`, `cloud`, `folder`, `heart`, `home`, `leaf`, `lock` and `user` are no longer
canonical definitions or Aster collection members. Their former path-based implementations carry
no compatibility promise. The accepted Amellus inventory retains the concepts so each can be
redesigned with portable structural primitives where possible and use a path only when no
adequate primitive composition exists.

## Semantic adjacency

The retained pilot checks these potentially confusing pairs:

| Pair | Required distinction |
| --- | --- |
| `plus` and `close` | Orthogonal versus diagonal construction. |
| `search` and `settings` | Handle-directed action versus radial mechanical detail. |
| `check` and `close` | Asymmetric confirmation stroke versus centred opposing diagonals. |

Distinct markup proves structural uniqueness, not semantic recognisability. Human review at
minimum size remains required before the pilot is approved.

## Provenance and licence

The retained pilot definitions are original Aster artwork curated and authored by BlueLuscious.
Their effective artwork licence is ISC. No third-party source, Illustrator master, imported SVG or
generated definition is canonical for this set.

The authoritative source for each retained icon is its TypeScript module in `@aster/icons`. SVG
rendered through `@aster/svg` is disposable review evidence and is not persistent distribution
output.
