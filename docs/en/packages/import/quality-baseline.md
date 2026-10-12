# Import Quality Baseline

Status: **Accepted comparison boundary**

This baseline records the frozen initial Import boundary and its final hardening comparison. It
measures public operations and emitted distribution without granting Import filesystem, process or
discovery authority.

## Workload boundary

The [API](api/index.md) owns the exported composition and operation contracts;
[Adoption](adoption/index.md) owns retained values, and
[Compatibility](compatibility.md) owns dependencies and private distribution.
[Quality](quality.md) records correctness scenario families independently from timing.

Inspection measures source isolation, parser safety, validation and normalisation. Definition
measures reviewed Core construction from a prepared draft; emission measures editable
serialisation from a prepared definition. Single and batch adoption include their complete
composition, collision handling, ordering and freezing. Host acquisition and persistence are
excluded. All fixture state is prepared outside timed loops.

## Performance comparison

Run:

```sh
pnpm benchmark:import
```

The command builds Core and Import, prepares all fixture state outside timed loops, runs Node with
explicit garbage-collection access, prints one JSON report and writes no artefact. The initial
fixtures contain a 167-byte minimal source, a 506-byte editor export, a 72-byte rejected source and
eight distinct batch requests. The report records those sizes, environment, methodology,
distribution shape and these scenarios:

| Scenario | Evidence |
| --- | --- |
| `import.inspect.minimal-svg` | Minimal accepted source parsing, validation and normalisation. |
| `import.inspect.editor-svg` | Accepted editor export containing finite known noise. |
| `import.inspect.rejected-svg` | Deterministic rejection of executable source without exception leakage. |
| `import.inspect.medium-svg` | Accepted source containing 16 equivalent geometry elements. |
| `import.inspect.large-svg` | Accepted source containing 64 equivalent geometry elements. |
| `import.define.reviewed-draft` | Core construction from a pre-inspected draft and reviewed metadata. |
| `import.emit.editable-module` | Editable TypeScript serialisation from a pre-defined icon. |
| `import.adopt.single-svg` | Complete single-source composition. |
| `import.adopt.batch-svg` | Atomic adoption and canonical ordering of eight distinct requests. |
| `import.adopt.large-batch-svg` | Atomic adoption and canonical ordering of 32 distinct requests. |

The seven original operation scenarios retain their fixture and measurement semantics. The three
additional scenarios provide explicit scaling evidence without replacing that comparison matrix.

## Final comparison evidence

A representative Node 24.10 Windows x64 comparison after structural hardening emitted 141 ESM
modules, 141 declaration modules and 280,181 unminified bytes. The frozen initial boundary emitted
143 modules of each kind and 281,874 bytes. The reduction follows removal of unconsumed internal
validation evidence rather than output compression or public-surface changes.

Repeated local samples placed minimal inspection near 0.10 milliseconds, editor-export inspection
near 0.25 milliseconds, reviewed definition construction near 0.01 milliseconds, editable module
emission near 0.02 milliseconds and complete single-source adoption between 0.14 and 0.17
milliseconds. These observations attribute the material cost to source tokenisation, safety,
validation and normalisation rather than Core construction or TypeScript serialisation.

The 801-byte, 16-element source inspected in approximately 0.43 milliseconds; the 2,969-byte,
64-element source inspected in approximately 1.51 milliseconds. Increasing geometry fourfold
therefore remained below fourfold elapsed growth in the reference run. Increasing a batch from
eight to 32 equivalent adoptions increased elapsed time from approximately 1.13 to 4.96
milliseconds. That small excess over fourfold growth falls within advisory benchmark and garbage
collection variation and does not establish superlinear behaviour.

Heap samples are retained in the report as diagnostic evidence, not stable allocation promises.
Parser-owned token objects, Aster-owned syntax and source evidence, canonical diagnostics, isolated
Core definitions, sorting and deep freezing are intentional costs. They are not bypassed to improve
an advisory number. Repeated validation at the validation-to-normalisation trust hand-off also
remains deliberate until an immutable intermediate representation demonstrates a measured net
benefit without weakening the boundary.

### Cost attribution

| Cost family | Observable evidence | Accepted interpretation |
| --- | --- | --- |
| Tokenisation and source evidence | Present in every inspection; larger accepted sources scale with bytes and elements. | The parser dependency is contained, while Aster retains its own syntax, safety and exact span evidence. |
| Repeated source scans | Indexed tag locations keep collection-scale parser conformance bounded. | No remaining repeated whole-source scan justifies a cache or mutable source index. |
| Path parsing | Included in accepted inspection and repeated at the normalisation trust hand-off. | The second finite parse protects validation assumptions; removal requires a measured immutable intermediate model. |
| Diagnostic construction | Executable-source rejection remains materially cheaper than accepted inspection. | Stable code policy, source spans, ordering and freezing do not dominate the rejected path. |
| Core revalidation | Isolated by `import.define.reviewed-draft`. | Approximately 0.01 milliseconds is immaterial beside source inspection and preserves the portable Core authority. |
| TypeScript serialisation | Isolated by `import.emit.editable-module`. | Approximately 0.02 milliseconds does not justify generated-template caching or retained mutable state. |
| Sorting and freezing | Included in single and batch adoption. | Near-linear batch growth supports deterministic ordering and deep isolation without a shortcut. |

Warm-up and repeated in-process samples use the
[shared benchmark methodology](../../tooling/performance/index.md). A cold
process scenario is intentionally absent: Import has no executable, process lifecycle or host
startup contract. Rejected malformed and adversarial families remain correctness fixtures; the
representative executable-source rejection establishes the initial timed rejection path without
turning every safety rule into a performance target.

## Interpretation

Results are comparison evidence, not speed promises or CI thresholds. Timing and heap pressure are
compared only under equivalent machines, runtime revisions and fixture sizes. Distribution counts
describe unminified compiler output. A later optimisation must improve a material scenario without
weakening diagnostics, isolation, determinism, safety or package boundaries.
