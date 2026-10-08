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
| Catalogue runtime tests | Ordering, filters, search, ambiguity, empty values, membership consistency and exact-loader counts. |
| Export and Review tests | Complete deterministic plans, path collisions, contained SVG failures, static offline HTML and authored-text escaping. |
| Executable tests | Grammar, human/JSON/raw-SVG modes, streams, status, output options and ownership-gated review replacement. |
| Installed-version tests | Nearest-project selection, direct roots, divergent dependency copies, optional absence, location comparison and atomic post-startup failures. |
| ABI and packed-consumer tests | Exact root/binary mapping, inaccessible implementation subpaths, strict engines, declaration/dependency direction and independent host equivalence. |
| Output-host tests | Portable confinement, exclusive staging, existing/interrupted targets, cleanup, guarded replacement and rollback. |

Run the package gate with `pnpm --dir packages/cli run test`; the distribution and executable
subset is `pnpm --dir packages/cli run test:conformance`. Subprocess evidence requires permission
to start child Node processes; an unavailable process is not a CLI failure result.
[Project testing](../../project/testing.md) owns cross-package verification policy.

## Integration evidence

Root import does not evaluate Icons. Fresh-process probes distinguish manifest-only discovery
from exact Export/Review definition loading. Module sets and their historical counts belong to
the [baseline](quality-baseline.md#lazy-integration-evidence), not a permanent file-count promise.

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
