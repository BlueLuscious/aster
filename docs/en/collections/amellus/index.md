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
| Intended module | `amellus.collection.ts` |
| Intended public subpath | `@aster/icons/collections/amellus` |
| Curator and original artwork author | BlueLuscious |
| Intended artwork licence | [ISC](../../../../LICENSE) |
| Lifecycle | Proposed until visual, technical, provenance and curatorial acceptance is complete. |

`Amellus` is the frozen identity for Aster's foundational minimalist general-purpose collection.
The identity reserves a collection name and product boundary; it does not assert that an
`AmellusCollection` definition, its inventory, or any release-quality artwork already exists.

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

## Pilot relationship

The sixteen Experimental Aster pilot icons are candidate inputs, not inherited members. Each may
be retained unchanged, refined, kept independently, or removed after the Amellus visual language
and inventory establish objective comparison criteria. The Experimental `aster` collection
continues to own its current membership until that disposition is explicit.

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

Promotion from Proposed requires a documented visual language, bounded inventory, complete
canonical definitions, collection composition, static review, pilot disposition, package
conformance and release evidence. Documentation alone does not promote the collection.
