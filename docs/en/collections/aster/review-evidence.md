# Aster Pilot Review Evidence

Status: **Accepted**

This document records reproducible automated evidence, accepted visual observations, exceptions,
and the curatorial decision for the Experimental Aster pilot. It does not promote the collection
to Active or claim that automation measures artistic quality.

## Reproduction

Run:

```sh
pnpm run review:pilot
```

The command builds the workspace, reads `AsterCollection` through its public package subpath, and
recreates an owned disposable review boundary under `dist/review/aster`. It writes:

- one standalone SVG per canonical icon;
- contact sheets at `24px` and `16px` on light and dark backgrounds;
- a larger monochrome contour stress comparison;
- a construction-role reference comparison;
- one deterministic JSON technical report.

The host cleans only its fixed output boundary before writing complete UTF-8 files. The generated
artefacts are ignored distribution output, identify their source and reproduction command, and
must never be edited as canonical artwork.

## Automated Results

The current sixteen-member pilot reports:

| Evidence | Result |
| --- | --- |
| Blocking findings | `0` |
| Advisory findings against defined thresholds | `0` |
| Primitive range | `1..10` |
| ViewBox | Every icon uses `0 0 24 24`. |
| Construction subdivision | Every inspected coordinate and radius value follows `0.5` units. |
| Effective stroke | Every node resolves to a consistent `1.5`-unit stroke. |
| Complexity | Every icon remains below `16` primitives and `64` explicit path commands. |
| Distinct output | Every member produces distinct deterministic markup at `16px` and `24px`. |

Bounds are exact for explicit primitives. A path reports its endpoint and control-point envelope
rather than an exact painted-curve bound. Occupied area is the bounds rectangle divided by
viewBox area; it is not rasterised ink coverage.

The reported occupied-area ratio ranges from approximately `0.1953` for `cloud` to `0.6102` for
`star`. No accepted threshold currently turns that spread into a defect. It remains useful
comparison evidence for relative visual weight.

## Comparison Evidence

The generated reference sheet compares:

| Role | Members |
| --- | --- |
| Circular | `search`, `settings`, `camera` |
| Square | `lock`, `home`, `folder` |
| Diagonal | `arrow-left`, `check`, `close`, `star` |
| Asymmetric | `arrow-left`, `camera`, `folder`, `cloud`, `leaf` |
| Organic | `heart`, `cloud`, `leaf` |
| Detailed | `settings`, `camera`, `star` |

Curatorial visual inspection found no clipping, sheet-composition failure, colour-inheritance
failure, or loss of a complete geometry node. The semantic-adjacency pairs remain structurally
distinct on the generated sheets.

The relatively small occupied envelopes of `cloud` and `bell` compared with `star` and `settings`
are accepted for the Experimental pilot baseline. They remain review evidence rather than a new
family-wide rule. Recognisability, optical balance, negative space, curve tension, and artistic
cleanliness are not resolved by the technical report alone.

## Exceptions And Rule Discovery

No current icon has an accepted exception to the provisional viewBox, stroke, grid, safe-area, or
complexity contract.

The earlier `bell` clapper correction remains rule-discovery evidence: moving the guide from
`y = 21` to `y = 20` improved attachment while preserving the grid and safe area. The occupied-area
spread is evidence for review, but does not yet justify a new automated threshold or collection
rule.

No blocking automated finding remains unresolved. The design contract stays Provisional because
approval of this pilot does not yet establish stable thresholds for a larger catalogue.

## Curatorial Decision

| Authority | State |
| --- | --- |
| Automated technical evidence | Passed |
| Curatorial visual inspection | No blocking visual defect observed |
| Named curator approval | Approved by BlueLuscious for the Experimental pilot baseline |
| Active collection promotion | Not requested |

The curator accepted the generated default, minimum, dark, light, contour, and reference
comparisons. Future corrections return to the canonical `*.icon.ts` module and regenerate this
evidence.

## Residual Risks

- Exact painted path bounds and rasterised ink coverage are not measured.
- Display rasterisation varies across browsers, operating systems, and device-pixel ratios.
- The pilot has one outline weight and no size-specific or filled variants.
- Relative visual weight may require optical changes despite technical consistency.
- A larger catalogue may expose construction exceptions not represented by sixteen subjects.

The layered authority and approval requirements remain defined by
[Contribution and Review](../../governance/contribution-and-review.md).
