# CLI Export

Status: **Experimental**

The export feature converts exact definitions from explicit accepted catalogue providers into
complete immutable SVG artefact plans. It is host-neutral: it does not inspect argv, resolve an
output root, read or write files, or mutate process state.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `AsterExportArtefact` | Retains one canonical logical relative path, SVG media type, and complete SVG markup. | `content` is the public `SvgMarkupType` produced by `@aster/svg`. |
| `AsterExportPlan` | Describes one exact export target, subject, provider, requested identity, and complete ordered artefact sequence. | Uses `AsterExportSubjectType`, `exportTargets`, and `AsterExportArtefact`. |

## Public types and values

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `AsterExportSubjectType` | Closed `icon` or `collection` subject union. | Derived from the export branch of the command-subject authority. |
| `AsterExportOptionsType` | Closed common render options applied to one icon or every selected collection member. | Selects portable size, paint, stroke, and direction fields from Core `IconRenderOptions`. |
| `AsterIconExportOptionsType` | Extends common export options with one icon's optional accessible label and title. | Accepted only by the icon invocation variant. |
| `exportTargets` | Immutable runtime authority for supported export targets. | Currently contains only `svg`. |

## Runtime composition

`ExportOptionsNormaliser` validates, copies, and freezes the closed programmatic option record.
`CatalogueExportSelector` loads accepted snapshots, applies an optional exact provider scope, and
resolves either one icon or every member of one collection from that same provider. It rejects an
unavailable member rather than omitting it, even though snapshot acceptance already enforces that
invariant. `ExportPathFormatter` derives paths only from portable identities.
`SvgExportArtefactFactory` preflights every logical path and rejects collisions before rendering
through the public `Svg` API; it then translates target failures into Aster command diagnostics.
`ExportPlanQuery` publishes a result only after the complete selection renders successfully.

```text
structured export invocation
          |
          v
invocation and option acceptance
          |
          v
exact catalogue selection --> canonical identity ordering
          |
          v
public SVG rendering ------> logical path collision check
          |
          v
complete immutable export plan
```

Icon identities produce `[namespace/]name[@variant].svg`. Collection membership order does not
control artefact order. Provider registration order does not resolve ambiguity implicitly. Empty
collections produce an empty complete plan rather than a partial or invented artefact.

## Effects and failures

Expected lookup failures retain existing not-found and ambiguity semantics. SVG target failures
use `ASTER-CLI-007`; logical path conflicts use `ASTER-CLI-008`. Unexpected faults still enter the
generic command-kernel sanitisation boundary. Target-owned SVG failures never expose target or
Core messages through CLI diagnostics, while unrelated exceptions are not misclassified as
expected render failures before the command kernel sanitises them.

No partial plan is observable after member, path, or render failure. Equivalent provider record
order, collection membership order, and canonical invocation values produce byte-equivalent plans.
Filesystem publication is a separate standalone-host
responsibility and cannot be added to these contracts as an ambient capability. The broader
boundary is defined by the
[Command-line Boundary](../../../architecture/command-line-boundary.md#export-boundary).
