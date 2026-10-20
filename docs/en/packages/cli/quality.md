# CLI Quality

Status: **Accepted**

Quality evidence checks CLI's public contracts, lazy integration and private host effects.
[Compatibility](compatibility.md) defines the supported ABI; [workflow](workflow.md) traces
execution, and the [baseline](quality-baseline.md) retains measured findings.

## Conformance

| Evidence | Boundary verified |
| --- | --- |
| Type tests | Public contracts and discriminated unions, exact optional properties and host-neutral declarations. |
| Command runtime tests | Invocation and context rejection, immutable descriptors/results, explicit providers and sanitised exceptions. |
| Catalogue runtime tests | Provider-scoped glyph derivation, ordering, combined filters, search, ambiguity, empty intersections, membership consistency and zero-load metadata queries. |
| Export and Review tests | Complete deterministic plans, path collisions, contained SVG failures, static offline HTML and authored-text escaping. |
| Executable tests | Grammar, human/JSON/raw-SVG modes, streams, status, output options and ownership-gated review replacement. |
| Installed-version tests | Nearest-project selection, direct roots, divergent dependency copies, optional absence, location comparison and atomic post-startup failures. |
| ABI and packed-consumer tests | Exact root/binary mapping, inaccessible implementation subpaths, strict engines, declaration/dependency direction and independent host equivalence. |
| Output-host tests | Portable confinement, exclusive staging, existing/interrupted targets, cleanup, guarded replacement and rollback. |

Own-data regressions exercise descriptor admission, explicit shadowing fields and absent options
through complete queries, plans, human presentation and Review HTML. Host tests ensure inherited
flags cannot request publication or version I/O, and inherited manifest sections cannot supply
dependencies. Packed type and executable/programmatic consumers verify the exact
`memberIdentities` contract. These checks preserve output layout and diagnostic conventions.

Membership regressions compare all 3,185 ordered two-icon/two-collection graphs against an
independent collection-first traversal, including missing members and conflicting reverse claims.
Repeated commands also change mutable provider evidence between calls and verify fresh validation,
unchanged earlier results and zero definition loads. No elapsed-time assertion enters these tests.

Run the package gate with `pnpm --dir packages/cli run test`; the distribution and executable
subset is `pnpm --dir packages/cli run test:conformance`. Subprocess evidence requires permission
to start child Node processes; an unavailable process is not a CLI failure result.
[Project testing](../../project/testing.md) owns cross-package verification policy.

Installed TypeScript consumers are compiled and executed, with compile-only rejection cases
guarded from execution. They reject missing treatments, flat membership and dictionary rendering;
runtime probes separately reject those inputs and revalidate JSON definitions through public Core.
Complete Core/SVG/CLI API and Icons discovery examples are also compiled and executed against
installed packages directly from their owning guides, not copied into independent sample sources.

## Integration evidence

Root import does not evaluate Icons. Fresh-process probes distinguish manifest-only discovery
from exact Export/Review definition loading. Measured module sets and counts belong to
the [baseline](quality-baseline.md#lazy-integration-evidence), not a permanent file-count promise.
Installed glyph queries also run under a native import guard that blocks artwork, generated
facades and network hosts; a direct artwork import is the negative control proving the guard works.

Packed consumers verify project versions separately from the executed CLI, including a project CLI
different from the running one and independently resolved dependency groups. Version queries
acquire neither Icons definitions nor network services. Missing Core or SVG before startup remains
a native Node failure, not a command diagnostic.

## Retained limits

[Shared data inspection](shared/index.md) rejects reflective state before retaining data;
providers remain explicit capabilities, not trusted result graphs. [Output](shell/output/index.md)
narrows ordinary races but promises no crash-atomic exchange or protection from hostile concurrent
path mutation. Review remains finite and static.

Performance changes require measured attribution under the
[shared comparison rules](../../tooling/performance/index.md#comparison-limits); passing timing
samples never justify weakened validation, mutable caches, ambient registries or ABI changes.
