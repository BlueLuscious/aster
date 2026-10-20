# Import Quality Baseline

Status: **Measured private boundary**

This guide owns current Import performance methodology and observations. Import measures acquired
text and produces portable definitions or editable source; it does not acquire files, start a
process, discover artwork or persist output. [Quality](quality.md) owns correctness evidence.

## Operation Boundaries

Inspection includes source isolation, parser safety, technical validation and draft normalisation.
Definition measures reviewed Core construction from a prepared draft; emission measures editable
serialisation from a prepared definition. Adoption includes their complete composition, while batch
adoption also includes collision checks, canonical ordering and freezing. Fixture preparation,
host byte acquisition and persistence stay outside these timings.

The [API](api/index.md) defines the operations, [Adoption](adoption/index.md) defines their retained
values and [Compatibility](compatibility.md) defines private distribution and dependencies.

## Reproduction

```sh
pnpm benchmark:import
```

The command builds Core and Import, prepares fixtures outside timed loops, runs Node with explicit
garbage-collection access and prints one schema-two JSON report without writing an artefact.
It records environment, fixture sizes, distribution shape and these fixed scenarios:

| Scenario | Measured Work |
| --- | --- |
| `import.inspect.minimal-svg` | Accepted minimal source inspection. |
| `import.inspect.editor-svg` | Inspection of supported editor-export noise. |
| `import.inspect.rejected-svg` | Rejection of executable source without exception leakage. |
| `import.inspect.medium-svg` | Inspection of 16 equivalent geometry elements. |
| `import.inspect.large-svg` | Inspection of 64 equivalent geometry elements. |
| `import.define.reviewed-draft` | Core construction from prepared geometry and reviewed metadata. |
| `import.emit.editable-module` | Editable TypeScript serialisation from a prepared definition. |
| `import.adopt.single-svg` | Complete single-source adoption. |
| `import.adopt.batch-svg` | Atomic adoption of eight requests. |
| `import.adopt.large-batch-svg` | Atomic adoption of 32 requests. |

The [shared measurement owner](../../tooling/performance/index.md) defines sampling, checksums,
bounded processes and resource observations. Functional tests do not enforce wall-clock thresholds.

## Scaling Method

Supplemental measurements separate tokenisation, parsing, technical validation, draft construction,
Core admission, emission and complete adoption. Geometry varies independently from one path's
command count, decoded source length, metadata/provenance width and batch size. Unicode and newline
fixtures retain exact source spans; malformed, unsafe and over-limit inputs retain their rejection.

The bounded matrix covers 1, 16, 64, 256 and 1,000 geometry leaves, plus 9,999 leaves at the accepted
10,000-element ceiling including the root. Source workloads range from approximately 1 Ki to 1 Mi
UTF-16 code units. UTF-8 bytes are recorded separately, not inferred from character count. The
[parser](formats/svg/parser/index.md#parser-limits) owns all accepted ceilings.

Batches cover 1, 10, 100, 1,000 and 10,000 unique identities with repeated source content. Separate
fixtures vary geometry across up to 23 content forms; an independent 100/1,000-request cohort uses
unique fixed-width inert markers while holding geometry constant. A batch's total bytes and
content diversity are separate from the size of one source. Empty batches, identity/export
collisions and last-entry failure are checked without publishing partial results.

Local observations use Node 24.10.0, V8 13.6 on Windows x64. Values are medians of three worker
medians, each retaining seven samples. Operation counts are calibrated once before comparison and
held fixed at equivalent absolute package paths. Matched controls preserve dependencies, fixture
work and full output fingerprints; profiles and resource probes run separately from native timing.
Larger tiers require a successful bounded preflight rather than an automatic expansion of every
workload. No registry, file-acquisition or concurrent host work enters these operation figures.

## Current Observations

| Complete Operation | Fixture | Median |
| --- | --- | ---: |
| Inspect | One circle | 0.058 ms |
| Inspect | 64 circles | 0.920 ms |
| Inspect | 1,000 circles | 13.903 ms |
| Inspect | 9,999 circles, plus the root at the element ceiling | 229.090 ms |
| Inspect | One path with 1,001 commands | 1.721 ms |
| Inspect | 1,048,576-unit source padded with an inert comment | 10.417 ms |
| Inspect | 1,048,576-unit source with one long editor attribute | 46.915 ms |
| Define | Reviewed draft with 64 circles | 0.092 ms |
| Emit | Prepared definition with 64 circles | 0.019 ms |
| Adopt batch | 1,000 identities sharing one source content | 94.125 ms |
| Adopt batch | 1,000 unique inert markers, with constant geometry | 87.519 ms |
| Adopt batch | 10,000 identities sharing one source content | 645.747 ms |

Batch rows measure the whole batch, not one icon. These synthetic circle/path fixtures do not
predict the cost of arbitrary editor exports or artwork. Prepared drafts and definitions are not
inspection shortcuts: those rows measure different operations with their own accepted inputs.

## Cost Interpretation

Inspection remains sensitive to lexical shape as well as byte count. A large inert comment can
be skipped after its opening delimiter; an equally long attribute requires scanning its content.
An element's syntax, exact source evidence and portable geometry also have different costs from
whitespace or one long path. Byte count alone cannot predict inspection time.

Profiles isolate entity scanning from dependency tokenisation and exact source locations. The
[parser boundary](formats/svg/parser/index.md#trust-boundary) owns lexical traversal and admission;
path validation, draft isolation, Core admission, provenance escaping and editable serialisation
remain independent measured work rather than omitted stages.

Resource probes report sampled/lifetime RSS, post-GC heap and observed GC events. RSS is not live
JavaScript data, post-GC heap is not total allocation, and event counts depend on process history
and V8's heap policy. Neither low post-GC growth nor a small event count proves absence of leaks.
Instrumented time is not pooled with native latency or used to promise a particular memory saving.

Separate probes of five 10,000-request adoptions record approximately 365 MiB process lifetime
RSS high-water and 15.1 MiB post-GC heap. These values include prepared fixtures and earlier
inspection work in that process; they are not per-icon costs, allocation rates or minimum memory
requirements for the library.

Results describe their measured fixtures and host, not portable speed guarantees, linear scaling
promises or CI budgets. There is no Import executable startup contract. Emitted modules depend on
Core rather than Import, and their downstream import/render costs belong to those consumers.
