# CLI Review

Status: **Pre-release**

The review feature converts one exact icon or collection from explicit catalogue providers into a
complete immutable technical document plan. Its internal static serialiser can then convert that
plan into self-contained HTML without inspecting argv, resolving an output root, accessing files,
launching a browser, or mutating process state.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `AsterReviewIconEvidence` | Retains one icon's portable identity, metadata, view box, node count, primitive families, memberships, and rendered SVG. | SVG markup is produced exclusively through public `@aster/svg`; portable values originate from accepted Core definitions. |
| `AsterIconReviewDocument` | Describes one exact icon review. | Retains one `AsterReviewIconEvidence` value and uses the `icon` discriminator. |
| `AsterCollectionReviewDocument` | Describes one exact collection and its ordered member evidence. | Retains collection identity and metadata plus zero or more `AsterReviewIconEvidence` values. |
| `AsterReviewPlan` | Describes one selected provider, subject, identity, output target, and complete technical model. | Retains `AsterReviewDocumentType`, `AsterReviewSubjectType`, and `reviewTargets.html`. |

## Public types and values

| Symbol | Responsibility | Relations |
| --- | --- | --- |
| `AsterReviewDocumentType` | Closed union of icon and collection technical models. | Discriminated by `reviewSubjects`. |
| `AsterReviewSubjectType` | Closed `icon` or `collection` review subject union. | Derived from `reviewSubjects`. |
| `reviewSubjects` | Immutable runtime authority for review value families. | Used by invocation, document, and plan discrimination. |
| `reviewTargets` | Immutable runtime authority for planned review representations. | Currently contains only `html`; publication remains a separate host effect. |

## Planning flow

`ReviewPlanQuery` delegates exact lookup to the shared catalogue subject selector also used by
Export. This preserves provider filtering, unavailable-provider, not-found, ambiguity, collection
membership, and canonical ordering semantics without a review-specific lookup implementation.

```text
structured review invocation
          |
          v
exact catalogue selection --> canonical member ordering
          |
          v
public SVG rendering ------> portable technical evidence
          |
          v
complete immutable review plan
```

An icon plan includes independent collection memberships. A collection plan includes collection
metadata and canonically ordered complete member evidence; an empty collection produces an empty
member sequence. Primitive families are unique and ASCII-ordered. No timestamp, host path,
environment value, current directory, or publication destination enters the plan.

## Static document serialisation

`ReviewDocumentSerialiser` is the single internal HTML-document authority. It accepts only a
complete `AsterReviewPlan` and returns deterministic HTML with LF line endings and exact Aster
ownership evidence. It does not form part of the public package ABI; the standalone publication
host composes it privately.

Each icon detail presents identity, display name, tags, RTL policy, view box, node and primitive
evidence, collection memberships, deprecation, replacement, licence, attribution, presentation
policy, representative palettes, and a fixed 16, 24, 32, and 48 pixel size ladder. Grid and
viewport-bound comparisons are review-only layers around the rendered SVG. A safe-area panel
reports unavailable evidence because Core definitions retain no safe-area profile; the review
does not invent collection authoring policy.

Collection reviews present metadata, member count, a canonically ordered contact sheet, and
anchored detail for every member. Empty collections retain an explicit empty state. Semantic
header, navigation, main, section, article, definition-list, figure, details, and footer landmarks
provide meaningful document structure. Navigation links and native details controls remain
keyboard reachable.

All CSS and SVG are inline. The document contains no scripts, external fonts, images, stylesheets,
or network references. Fixed review CSS owns every visual value. Authored metadata is escaped for
HTML text, rendered SVG enters only from public `@aster/svg`, and no authored value becomes CSS or
raw markup. Equal plans produce byte-identical documents.

## Effects and failures

Expected lookup failures retain existing catalogue diagnostics. Public SVG failures become the
existing `ASTER-CLI-007` render-failure family without leaking target details or a partial model.
Unexpected exceptions remain contained by the command kernel.

The standalone parser accepts `review icon` and `review collection`, with optional `--catalogue`,
shell-owned `--output`, and shell-owned `--replace`. Output and replacement authority never enter
the programmatic invocation or plan.

Human execution publishes `index.html` beneath `aster-review` by default or beneath the explicit
`--output` root. A new publication requires an absent target. `--replace` permits replacement only
when the existing `index.html` carries the exact Aster review marker and remains byte-identical
through the replacement preflight. JSON mode returns the host-neutral plan and cannot be combined
with publication options.

The publisher writes the complete new document to a private sibling stage. For replacement, it
moves the unchanged owned target to a private backup, commits the complete stage, and then removes
the backup. A commit failure restores the previous review before reporting a sanitised failure.
Unrelated destinations, interrupted stages, existing backups, and changed ownership evidence are
never removed implicitly.
