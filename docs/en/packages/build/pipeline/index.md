# Build Pipeline

Status: **Experimental**

`CollectionBuildPipeline` is the public host-independent composition boundary of `@aster/build`.
It accepts already acquired canonical sources and an optional existing text snapshot, then runs
metadata decoding, safe SVG parsing, technical and collection validation, portable definition
normalisation, deterministic package planning, and cleanup analysis.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CollectionBuildFile` | Carries one generated-root-relative text path and exact content. | Used for existing snapshots and successful files. |
| `CollectionBuildEntry` | Pairs independently acquired SVG and icon metadata sources. | Retained by `CollectionBuildRequest`. |
| `CollectionBuildRequest` | Carries a collection source, all source pairs, and optional existing files. | Input to `CollectionBuildPipeline.build()`. |
| `CollectionBuildOutput` | Carries the complete ordered generated text set and safe stale paths. | Present only in a successful `DiagnosticResultType`. |

The pipeline preserves warnings alongside complete successful output. Any blocking diagnostic
prevents the output value entirely, so an effectful host cannot accidentally commit a partial
package.

## Effect boundary

The pipeline does not discover directories, decode bytes, follow filesystem entries, create
output directories, invoke TypeScript, write terminal text, mutate accepted output, or set process
status. No production host is implemented yet. A minimal future CLI is expected to own source
discovery, strict byte decoding, terminal presentation, staged compilation, and output commit
while delegating all domain transformation to this pipeline.

Planned paths occupied by human-owned files already fail during generation planning rather than
being returned as safe output.

## Troubleshooting

- A metadata diagnostic identifies canonical source content; correct that source and rebuild.
- A Generation ownership diagnostic means a planned path contains human-owned text; move or remove
  it deliberately rather than adding an ownership marker.

The generator details are documented by
[Build Generator](../generator/index.md), while diagnostic ordering and result authority are
documented by [Build Diagnostic](../diagnostic/index.md).
