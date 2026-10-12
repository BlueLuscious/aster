# Amellus Collection

Status: **Accepted**

Collection lifecycle: **Active**

Amellus is Aster's foundational minimalist general-purpose collection for application interfaces.
This page owns its identity, provenance and accepted human review. The
[visual contract](design-contract.md) owns design rules; the [inventory](inventory.md) owns
concepts, semantic order and stress coverage.

## Identity

| Field | Value |
| --- | --- |
| Display name | Amellus |
| Canonical slug | `amellus` |
| Botanical identity | *Aster amellus* L. |
| Catalogue identity | `{ name: "amellus" }` |
| Canonical collection | `Amellus`, authored in `amellus.collection.ts` |
| Public subpath | `@luscious-garden/aster-icons/collections/amellus` |
| Curator and original artwork author | BlueLuscious |
| Artwork terms | [Aster Artwork Licence 1.0](../../../../packages/icons/ARTWORK-LICENCE.md) |

## Naming decision

The [Garden Aster Species Registry](https://github.com/BlueLuscious/garden/blob/master/docs/en/products/aster/species-registry.md)
owns the botanical assignment. [Kew](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A331070-2/general-information)
recognises *Aster amellus* L. as an accepted species;
[IPNI](https://www.ipni.org/n/331068-2) records it as the designated type of *Aster*.
That reference relationship supports the foundational collection's role. The short name denotes
this full species assignment within Aster, not a second product genus or a geometry source.

## Purpose and membership

Amellus covers common navigation, action, status, communication, media and object metaphors.
It provides a coherent neutral baseline rather than branded or domain-specific illustrations.
Its [visual exclusions](design-contract.md) and [semantic distinctions](inventory.md) govern
admission; unreviewed catalogue growth is not a maturity goal.

The canonical collection module's explicit dictionary is the membership authority.
[Icons Collections](../../packages/icons/collections/index.md) owns imports, aliases, ordered
members and runtime costs. The collection identity is not an icon namespace: member definitions
keep independent identities and can exist outside Amellus or join other collections.

## Provenance and acceptance evidence

Current artwork is authored and curated by BlueLuscious. The
[artwork licence](../../../../packages/icons/ARTWORK-LICENCE.md) owns its permissions and obligations;
the [ISC notice](../../../../packages/icons/LICENSE) governs software and documentation.
The [Icons rights boundary](../../packages/icons/index.md#rights-boundary) explains those scopes.

Each accepted icon retains:

- one canonical editable TypeScript definition with independent portable identity;
- original authorship, effective artwork licence and attribution, with an explicit source statement;
- semantic purpose, intrinsic discovery terms and RTL policy;
- deterministic Core and SVG evidence;
- review at the accepted default and minimum sizes;
- curator approval for recognition, optical balance, family consistency and any exception.

Third-party or adapted candidates require identified sources, compatible terms, transformation
authority and explicit curatorial approval before inclusion. Botanical references justify the
name only; their text and images are not artwork sources or a licence for Amellus geometry.

[Icons Quality](../../packages/icons/quality.md) owns automated conformance. The human findings
below, provenance and [collection acceptance policy](../index.md#acceptance) support the Active
lifecycle. Publication remains separate under the
[project versioning policy](../../project/versioning.md).

## Static visual acceptance

The complete inventory passed static visual review through the canonical catalogue and SVG
workflow. The accepted review covered `16px`, `24px`, `32px` and `48px`; light, dark and
transparent backgrounds; neutral and contrasting foregrounds; construction grids and view-box
bounds.

Reconstruct the review surface from a built workspace:

```sh
pnpm run build
pnpm exec aster review collection amellus --output ./aster-review --replace
```

The generated directory is disposable evidence outside source control.
[CLI Review](../../packages/cli/review/index.md) owns its composition and files; these written
findings retain the human acceptance record, not a promise that regenerating HTML repeats that
review automatically.

The review accepted:

- recognisable silhouettes and usable negative space at the `16px` minimum;
- coherent `1.5`-unit outline weight, round terminals and round joins across primitive/path geometry;
- distinct arrows, action marks, media controls, status enclosures and object metaphors;
- deliberate curves and organic forms without visible polygonal stepping, cusps or flat sections;
- associated detached details in `bell`, `info` and `warning`;
- visible geometry within the view box after stroke expansion and consistent nominal safe-area use;
- exact horizontal arrow counterparts with RTL mirroring, while vertical arrows and
  non-directional subjects preserve authored geometry.

No collection-level exception or canonical geometry correction was required by that review.
Changes to artwork or rendering require renewed technical and curatorial evidence.
