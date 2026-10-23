# Testing Policy

Status: **Accepted**

The adopted [Garden testing rules](https://github.com/BlueLuscious/garden/blob/master/docs/en/project-rules.md#tests-fixtures-and-temporary-evidence)
own shared evidence, fixture, isolation and temporary-cleanup policy. This guide maps that policy
to Aster's suites, real-catalogue boundaries and verification requirements.

## Evidence roles

Role meanings belong to Garden; their concrete Aster suite owners are:

| Suite | Primary roles |
| --- | --- |
| Package `tests/types/` | Contract and Boundary for TypeScript acceptance/rejection. |
| Package `tests/runtime/` | Contract, Regression and Boundary for source behaviour. |
| Package `tests/abi/` | Conformance for emitted package surfaces. |
| CLI `tests/executable/` | Boundary and Conformance for the installed process interface. |
| Root `tests/tooling/` | Boundary and Measurement for private repository capabilities. |
| Root `tests/workflow/` | Workflow for compositions that no individual package can prove. |

## Fixture ownership

Package suites own synthetic portable inputs. Exact Aster artwork remains relevant when it is the
subject; diagnostics, export maps, markup ordering and fixed benchmark inputs also retain their
exact data when it defines the tested guarantee.

Real-catalogue tests discover through manifests and acquire definitions through exact loaders.
Required families must reject an empty catalogue instead of silently passing. Exact identities
remain appropriate for identity-specific semantics such as RTL relationships and stable subpaths;
they are not a reason to couple unrelated tests to current artwork.

## Isolation and effects

Garden owns the shared isolation and process-boundary rules. Aster's independently runnable
distribution and workflow commands retain their build prerequisites under
[verification orchestration](../tooling/index.md#verification-orchestration); catalogue output
ownership and drift checks belong to [catalogue tooling](../tooling/catalogue/index.md).

## Verification requirements

The complete repository gate is `pnpm run verify`. CI must pass the frozen installation and this
gate on both Ubuntu and Windows; local success does not replace either clean environment.
Frozen installation is a CI/release prerequisite, not a test responsibility.

[Repository tooling](../tooling/index.md) owns command composition, build orchestration and
toolchain configuration. [Package quality guides](../packages/index.md) own their narrower
conformance evidence. [Publication](publication.md) requires separate maintainer approval even
after verification passes.
