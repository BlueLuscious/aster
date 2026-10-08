# Documentation Tooling

Status: **Accepted**

The documentation feature verifies objective canonical-documentation invariants through
`pnpm check:docs`. It does not score prose, enforce subjective style, or replace technical and
curatorial review.

## Current verification

The verifier requires canonical entry points for the root, project, packages, tooling, collections,
and future capabilities. It also verifies:

- package and authored feature documentation mirror real workspace packages and their `src/`
  feature roots; generated output is not treated as an authored feature, and each package's
  `releases/` history is documentation rather than a source feature;
- local Markdown links resolve within the repository;
- canonical prose contains no local plans, task identifiers, or contributor-machine paths;
- Markdown files are discovered and reported in deterministic order.

The exported `verifyDocumentation(workspaceRoot)` function returns issues and the inspected Markdown
count without owning terminal or process state. Its command adapter resolves the repository root,
prints the result, and sets failure exit state.

## Composition

`DocumentationVerifierFactory` composes one fresh verifier from repository capabilities and
feature-owned policies. `DocumentationVerifier` preserves this stable execution order:

1. `DocumentationHierarchyInspector` verifies required canonical entries.
2. `PackageDocumentationMirroringInspector` compares real and documented package and feature
   membership.
3. `CanonicalDocumentReader` acquires Markdown only from the accepted canonical roots and files,
   once and in deterministic order.
4. `CanonicalDocumentInspector` applies local-reference and local-link policies to each document.

`DocumentationIssueCollector` accumulates every policy finding in inspection order and returns an
immutable snapshot. The completed verification report and its issue list are frozen; acquisition
and policy collaborators remain borrowed. Malformed percent-encoding in a local link becomes a
documentation finding without preventing inspection of subsequent links. Filesystem failures and
unreadable authorities remain operational failures.

## Acquisition

`CanonicalDocumentReader` produces internal `TCanonicalDocument` values containing an absolute
path and exact UTF-8 content. `TDocumentationContext` combines the explicit workspace root,
canonical documentation root, and ordered acquired documents. Policies consume that context and
never derive authority from the ambient current directory. The verifier snapshots document
records before asynchronous policies run, so a custom reader cannot change the active inspection
set or its reported count after acquisition.

Filesystem acquisition, path handling, directory discovery, and deterministic traversal come from
[Shared Tooling](../shared/index.md). Documentation policy does not leak into that shared boundary.

## Policies

Root inspectors implement the internal `IDocumentationInspector` contract. Per-document policies
implement `ICanonicalDocumentPolicy`, allowing the document inspector to retain policy order for
each document rather than regrouping findings by policy.

| Inspector or policy | Responsibility |
| --- | --- |
| `DocumentationHierarchyInspector` | Requires canonical documentation entry points. |
| `PackageDocumentationMirroringInspector` | Detects undocumented and stale packages and authored package features. |
| `LocalReferencePolicy` | Rejects local plans, implementation identifiers, and contributor-machine paths. |
| `LocalLinkPolicy` | Rejects repository escapes, absent local link targets and malformed local target encoding. |

`MarkdownLinkTargetExtractor` performs only the lexical extraction needed by local-link policy. It
does not parse Markdown generally, validate external URLs, inspect anchors, or evaluate prose.

## Authorities

Closed documentation vocabulary is owned by immutable feature constants:

| Authority | Responsibility |
| --- | --- |
| `documentationHierarchy` | Canonical root, accepted directories and files, package root, Markdown extension, and required entries. |
| `localReferenceRules` | Forbidden contributor-local reference patterns and stable labels. |
| `markdownLinkRules` | Local link extraction and external-scheme classification grammar. |

These authorities enforce only objective repository policy. British English quality, technical
accuracy, readability, completeness, package truth and curatorial judgement remain human review
responsibilities. A passing command proves the listed structural invariants only; it is not a
general documentation-quality score.

## Tests

Fixture tests create self-contained temporary canonical hierarchies and exercise accepted roots,
package and feature mirroring, collection independence, non-canonical-root exclusion, broken links, and local
references. Focused tests verify every isolated inspector or policy, malformed local link encoding,
continued link inspection, local-link extraction,
per-document ordering, explicit roots, acquisition count, and overall orchestration.
