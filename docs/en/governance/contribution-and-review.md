# Contribution and Review

Status: **Accepted**

This document defines responsibility and approval for software, collection, source, metadata, and
generated-output changes. Passing automation is necessary but never sufficient evidence of
curated visual quality.

## Roles

| Role | Responsibility |
| --- | --- |
| Contributor | Proposes a bounded change, supplies canonical sources and metadata, declares provenance, and provides required evidence. |
| Technical maintainer | Owns repository architecture, package contracts, security, deterministic generation, CI policy, and technical release approval. |
| Collection curator | Owns one collection's visual contract, reference set, exceptions, icon acceptance, and visual release approval. |
| Release maintainer | Verifies release scope, compatibility classification, generated state, release notes, and publication order. |

One person may fulfil more than one role, but every approval records the authority exercised.

Every Active collection names at least one current curator. An unavailable curator must be
replaced explicitly before ordinary visual releases continue. Repository maintainers cannot
silently assume curatorial authority merely because they can merge code.

## Ownership

Changes require approval from the authority that owns their observable consequences:

| Change | Required approval |
| --- | --- |
| Portable contracts, security, generator, renderer, package exports, or tooling policy | Technical maintainer. |
| Collection design rules, masters, SVG imports, visual metadata, or accepted exceptions | Collection curator. |
| A change affecting both software and collection output | Technical maintainer and collection curator. |
| Artwork licence, attribution, provenance, or distribution authority | Technical maintainer and collection curator after evidence is supplied. |
| Package publication and compatibility classification | Release maintainer plus every applicable owner above. |

Review comments do not constitute approval unless the reviewer has the required role and records
the decision through the repository's accepted review mechanism.

## Contribution evidence

A contribution supplies only the evidence relevant to its scope:

- authored source and metadata changes;
- editable master relationship when geometry changes;
- provenance and effective artwork licence;
- focused type, runtime, package, or conformance tests;
- deterministic regeneration evidence for generated output;
- before-and-after visual evidence at representative sizes for geometry changes;
- an accepted decision record when architecture changes materially;
- release and migration notes when compatibility changes.

Generated files are never edited directly. Their canonical planner, template, generator, or input
changes first, followed by deterministic regeneration.

## Layered review

A collection change passes four distinct layers:

1. **Technical checks.** Blocking automation validates syntax, safety, identity, metadata,
   portability, deterministic output, package contracts, and tests.
2. **Geometric advice.** Automated measurements compare the icon with declared collection rules.
   Advice remains non-blocking unless an accepted collection contract makes that rule mandatory.
3. **Visual review.** Reviewers compare references, contact sheets, minimum-size rendering,
   optical balance, semantic clarity, and documented exceptions.
4. **Curatorial approval.** The named curator accepts the final visual result and any explicit
   exception.

Automation cannot infer artistic intent or replace visual approval. Curatorial approval cannot
override safety, licensing, identity, deterministic generation, or public compatibility failures.

## Exceptions

A visual exception belongs to one collection and records:

- the affected canonical identity;
- the rule being excepted;
- the visual reason and evidence;
- the approving curator;
- whether the exception is permanent or requires later review.

An exception cannot weaken project-wide safety, portability, licensing, or deterministic-output
invariants.

## Merge and release readiness

A change is merge-ready when every required owner has approved it, blocking checks pass, generated
state is clean, and documentation describes the accepted behaviour.

Merge readiness is not publication authority. Release gates are defined by
[Versioning and Releases](versioning-and-releases.md).
