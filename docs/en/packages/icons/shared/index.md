# Icons Shared Authoring

Status: **Experimental**

The shared feature owns the immutable `asterIconAuthoring` defaults used by every canonical Aster
icon module. It is an internal authoring authority, not a public package export or a universal
Aster collection language.

## Authoring defaults

| Field | Value |
| --- | --- |
| Namespace | `aster` |
| Artwork licence | `ISC` |
| Attribution | `BlueLuscious` |
| ViewBox | `0 0 24 24` |
| Fill | `none` |
| Stroke | `currentColor` |
| Stroke width | `1.5` |
| Line cap | `round` |
| Line join | `round` |
| Caller overrides | None |
| Default size | `24` |
| Minimum size | `16` |

The value is frozen and checked against public Core `IconViewBox` and
`IconPresentationPolicy` contracts. Canonical modules reuse it so common technical presentation
cannot drift between icons through copied literals.

The authority contains no geometry, display name, tags, RTL decision, collection membership,
deprecation or replacement. Each icon owns those values independently. The collection design
contract remains the curatorial reason for these defaults; this feature records only their exact
package implementation.

No consumer may import `asterIconAuthoring` through a public subpath. Runtime consumers receive
the resolved deeply frozen values through each exported `IconDefinition`.
