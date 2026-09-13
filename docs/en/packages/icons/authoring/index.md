# Icons Authoring Authorities

Status: **Accepted**

The internal authoring feature owns two independent immutable inputs used by the current canonical
icon corpus. Neither authority is a public package export or a universal requirement for every
definition that may be distributed by `@aster/icons`.

## Original Aster authorship

`asterOriginalIconAuthorship` identifies artwork originally authored by Aster:

| Field | Value |
| --- | --- |
| Technical namespace | `aster` |
| Artwork licence | `ISC` |
| Attribution | `BlueLuscious` |

This authority contains no view box, presentation, geometry, tags, RTL policy or collection
membership. A differently owned or licensed definition supplies its own namespace and effective
legal metadata instead of using this object.

## Amellus visual profile

`amellusIconAuthoringProfile` records the intrinsic visual input shared by icons currently curated
for Amellus:

| Field | Value |
| --- | --- |
| ViewBox | `0 0 24 24` |
| Fill | `none` |
| Stroke | `currentColor` |
| Stroke width | `1.5` |
| Line cap | `round` |
| Line join | `round` |
| Caller overrides | None |
| Default size | `24` |
| Minimum size | `16` |

The object is frozen and checked against public Core `IconViewBox` and
`IconPresentationPolicy` contracts. It contains no namespace, licence, attribution, geometry,
display name, tags, RTL policy, deprecation state or collection membership. Another visual family
defines another narrow profile without modifying Amellus.

## Composition boundary

Applicable icon modules explicitly compose original Aster authorship with the Amellus profile when
calling `Icon.define(...)`. Core validates, isolates and deeply freezes the resulting complete
definition. A collection then retains that definition without applying, replacing or mutating
either authority.

The Amellus collection currently records the same licence and attribution for its own collection
metadata. Those values remain explicit because collection ownership and artwork authorship are
independent legal authorities even when their text happens to match.

No consumer may import either authoring object through a public subpath. Runtime consumers receive
only the resolved values carried by an exported `IconDefinition`.
