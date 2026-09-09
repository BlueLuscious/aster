# CLI Review

Status: **Pre-release**

The review feature converts one exact icon or collection from explicit catalogue providers into a
complete immutable technical document plan. It is host-neutral: it does not serialise HTML, inspect
argv, resolve an output root, access files, launch a browser, or mutate process state.

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
| `reviewTargets` | Immutable runtime authority for planned review representations. | Currently contains only `html`; serialisation is a separate phase. |

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

## Effects and failures

Expected lookup failures retain existing catalogue diagnostics. Public SVG failures become the
existing `ASTER-CLI-007` render-failure family without leaking target details or a partial model.
Unexpected exceptions remain contained by the command kernel.

The standalone parser accepts `review icon` and `review collection`, with optional `--catalogue`
and shell-owned `--output`. Output never enters the programmatic invocation or plan. Static HTML
serialisation and filesystem publication are not implemented by this boundary and remain separate
host responsibilities; the current executable rejects requested publication rather than silently
ignoring it.
