# Aster Experimental

Status: **Experimental**

`experimental` is the smallest real collection used to prove Aster's canonical
source-to-package workflow. Its sources exist to exercise architecture and tooling; they are not
a release-quality visual catalogue or a stable design promise.

## Identity

| Property | Value |
| --- | --- |
| Display name | Aster Experimental |
| Canonical slug | `experimental` |
| Lifecycle | Experimental |
| Purpose | Pipeline and generator evidence |
| Artwork licence | CC BY 4.0 |
| Attribution | Aster contributors |
| Curator | Unassigned while Experimental |

The lifecycle, licence, and attribution are encoded by the collection metadata. Promotion to
Active would require a named curator, representative visual evidence, and a separately accepted
release decision.

## Canonical sources

| Icon | Geometry coverage | Directional policy |
| --- | --- | --- |
| `frame` | Rectangle, line, and polyline | Preserve |
| `orbit` | Circle and ellipse | Preserve |
| `spark` | Closed path with fractional coordinates | Preserve |

Every icon has one canonical SVG and one matching metadata document. Invalid and warning-only
evidence lives outside the collection source boundary so it cannot enter generated distribution
output accidentally.

## Documents

- [Provisional Design Contract](design-contract.md)
- [Authoring and Export Boundary](authoring-and-export.md)
- [Collection and Source Boundary](../../architecture/collection-and-source-boundary.md)
- [Metadata and Identity Boundary](../../architecture/metadata-and-identity-boundary.md)

Generated definitions, package modules, previews, and review artefacts do not belong beneath this
collection source directory.
