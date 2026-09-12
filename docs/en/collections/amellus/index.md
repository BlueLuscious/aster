# Amellus Collection

Status: **Accepted identity**

Collection lifecycle: **Proposed**

## Identity

| Field | Value |
| --- | --- |
| Display name | Amellus |
| Canonical slug | `amellus` |
| Botanical identity | *Aster amellus* L. |
| Catalogue identity | `{ name: "amellus" }` |
| Canonical module | `amellus.collection.ts` |
| Public subpath | `@aster/icons/collections/amellus` |
| Curator and original artwork author | BlueLuscious |
| Intended artwork licence | [ISC](../../../../LICENSE) |
| Lifecycle | Proposed until visual, technical, provenance and curatorial acceptance is complete. |

`Amellus` is the frozen identity for Aster's foundational minimalist general-purpose collection.
`AmellusCollection` now retains the complete accepted inventory through the portable Core
collection boundary. Its Proposed lifecycle still makes no release-quality or stable artwork
promise before visual and release evidence is accepted.

## Naming decision

Garden normally associates a major product with a botanical genus and may use one species of that
genus for a durable identity inside the product. A species assignment is made only when the owned
concept exists, remains taxonomically valid, has a clear product role, and benefits from a name
that can survive implementation and package changes.

The accepted product genus is *Aster*. Kew Plants of the World Online recognises
[*Aster amellus* L.](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A331070-2/general-information)
as an accepted species. The International Plant Names Index records
[*Aster amellus* as the designated type of *Aster*](https://www.ipni.org/n/331068-2).
That type relationship gives `Amellus` a precise semantic role: it represents the reference
collection from which Aster establishes its first release-quality general icon language.

The epithet is not accepted merely because it sounds suitable. The evaluated candidates were:

| Candidate | Botanical evidence | Product fit | Outcome |
| --- | --- | --- | --- |
| `Amellus` | Kew accepts *Aster amellus*; IPNI records it as the designated type of *Aster*. | The type relationship directly supports a foundational and representative collection. | Accepted. |
| `Alpinus` | Kew accepts [*Aster alpinus* L.](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30147822-2/general-information) and associates it primarily with subalpine or subarctic biomes. | Its specialised environmental association suggests compactness or resilience more strongly than a neutral application baseline. | Not assigned; potentially useful for a future specialised collection. |
| `Ageratoides` | Kew accepts [*Aster ageratoides* Turcz.](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A180576-1/general-information). | Its taxonomic validity does not provide a comparably direct semantic relationship to a foundational icon set. | Rejected for this collection. |

Kew also recognises [`Amellus` as a separate genus](https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A329857-2).
The short display name is nevertheless unambiguous within Aster because the registry records the
complete scientific assignment *Aster amellus*, and `Amellus` is not available as another Garden
product identity while this assignment remains Used.

## Product boundary

Amellus is intended for common application navigation, actions, status, communication, media and
object metaphors. It targets product interfaces that need a coherent neutral icon baseline rather
than a branded, decorative or domain-specific illustration set. The initial inventory must remain
small enough for each icon to receive individual semantic and visual review.

The collection excludes:

- brand marks, logos, flags, text, embedded type, photographs and raster content;
- detailed illustrations or pictorial scenes that exceed a small-interface detail budget;
- exhaustive domain catalogues and aliases that do not represent distinct icon geometry;
- framework, DOM, component-library, editor or host-specific behaviour;
- variants, weights, fills or duotone families without a separately accepted visual need;
- mutable membership, mutable definitions or collection-owned icon identity.

The collection identity is `{ name: "amellus" }`. It does not become an icon namespace. Icons
remain independently defined under their own canonical identities, may exist without Amellus, and
may belong to Amellus and other collections simultaneously. Removing an icon from Amellus changes
membership only; it does not remove or rename the icon.

## Collection specification

The [visual design contract](design-contract.md) defines Amellus canvas, grid, safe-area,
presentation, geometry, minimum-size and RTL rules. The [initial inventory](inventory.md) defines
the bounded semantic set, search vocabulary, adjacent-concept distinctions and representative
stress coverage accepted for authorship.

These documents govern collection acceptance but do not create definitions, membership or
generated catalogue output merely by existing. The canonical TypeScript collection module is the
membership authority.

## Pilot relationship

The original Experimental Aster pilot does not own Amellus membership. Seven primitive-first
definitions belong to both collections through the same independent icon values. Nine former
raw-path candidates and their visually weak polygon replacements were discarded, then
independently reauthored through portable structured commands. All twenty-six accepted definitions
now belong to Amellus through explicit composition rather than inheritance from the pilot.

No compatibility promise, source alias or collection replacement relationship exists between
`aster` and `amellus` merely because pilot artwork is considered. Amellus must not preserve weak,
redundant or out-of-scope artwork to maintain an unpublished experimental surface.

## Provenance and acceptance evidence

Original Amellus artwork is intended to be authored and curated by BlueLuscious under ISC. Each
accepted icon must retain:

- one canonical editable TypeScript definition and its independent portable identity;
- the original author, effective artwork licence and an explicit third-party-source statement;
- a concise semantic purpose, intrinsic search tags and any RTL behaviour;
- deterministic Core validation and SVG rendering evidence;
- visual evidence at the collection's accepted default and minimum sizes;
- curator approval for recognisability, optical balance, family consistency and any exception.

Third-party or adapted artwork requires source provenance, compatible licensing, transformation
authority and explicit curatorial acceptance before inclusion. Botanical taxonomic pages support
the collection name only: their text and images are not artwork sources and confer no artwork
licence on Amellus.

Promotion from Proposed requires static visual review, pilot disposition, package conformance and
release evidence in addition to the accepted visual language, inventory, canonical definitions and
collection composition. Documentation alone does not promote the collection.

## Static visual acceptance

The complete twenty-six-icon collection has passed static visual review using the canonical
catalogue and SVG rendering workflow. Evidence covered `16px`, `24px`, `32px` and `48px` sizes;
light, dark and transparent backgrounds; neutral and contrasting foreground colours; construction
grids; and view-box bounds.

The review accepted the following findings:

- all icons retain recognisable silhouettes and usable negative space at the `16px` minimum;
- the `1.5`-unit outline weight, round terminals and round joins remain coherent across primitive
  and structured-path geometry;
- arrows, action marks, media controls, status enclosures and object metaphors remain distinct when
  compared as related families;
- curved and organic forms remain deliberate, without visible polygonal stepping, cusps or
  accidental flat sections;
- detached details in `bell`, `info` and `warning` remain associated with their enclosing forms;
- visible geometry remains within the view box after stroke expansion and uses the nominal safe
  area consistently;
- `arrow-left` and `arrow-right` remain exact directional counterparts and mirror under RTL, while
  vertical arrows and non-directional subjects preserve their authored geometry.

No collection-level exception or canonical geometry correction was required. This visual
acceptance satisfies the collection's review requirement but does not promote its lifecycle beyond
Proposed until pilot disposition and final technical acceptance are complete.
