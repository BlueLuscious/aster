# Diagnostics and Determinism

Status: **Accepted**

This document defines the project-level guarantees shared by Import source diagnostics and
deterministic target production. Detailed Import contracts remain canonical in
[Import Diagnostics](../packages/import/diagnostic/index.md), while SVG output guarantees remain
canonical in [SVG Quality](../packages/svg/quality.md).

## Import diagnostic shape

One `SourceDiagnostic` contains:

| Field | Meaning |
| --- | --- |
| `code` | Stable Aster-owned identifier. |
| `severity` | `error` or `warning`. |
| `category` | `syntax`, `safety`, `technical`, or `adoption`. |
| `message` | Deterministic British English explanation without environment-specific text. |
| `sourceId` | Host-supplied logical source identifier using `/` separators. |
| `span` | Optional exact start and end offsets with one-based line and column positions. |
| `related` | Optional ordered additional source relationships. |

`sourceId` provides diagnostic provenance only. It is not filesystem authority and Import never
resolves, reads, writes, or discovers it. Absolute paths, parent segments, backslashes, control
characters, stack traces, platform errors, timestamps, process identifiers, and parser-owned
messages cannot enter stable diagnostics.

Codes use `ASTER-<CATEGORY>-<NUMBER>`, for example `ASTER-SAFETY-001`. External parser failures are
translated into Aster-owned syntax or safety evidence without exposing dependency values.

## Locations

Offsets count UTF-16 code units in the exact decoded source and are zero-based. Lines and columns
are one-based for presentation; end offsets are exclusive. Import rejects a byte-order mark and
malformed Unicode before source parsing, while preserving accepted newline sequences so every
location continues to identify the supplied text.

A diagnostic without a trustworthy span identifies the complete logical source. Import never
fabricates location precision.

## Failure boundaries

- syntax failures represent malformed source or accepted-grammar violations;
- safety failures represent executable, external, foreign, embedded, or resource-limit risks;
- technical failures represent unsupported or invalid portable SVG evidence;
- adoption failures represent rejected Core construction, editable emission, or batch
  collisions.

Errors block the operation and return no value. Warnings may accompany one successful immutable
value. Malformed public API structure raises `IconImportError`; unexpected caller or implementation
execution failures are not converted into misleading source diagnostics.

## Deterministic ordering

Diagnostics use this ascending order:

1. canonical `sourceId`;
2. start offset, with whole-source evidence first;
3. end offset;
4. errors before warnings at the same location;
5. category;
6. code;
7. stable encounter index for otherwise equivalent evidence.

Exact duplicate diagnostics collapse to one immutable value. Text comparison uses Unicode
code-unit order rather than locale-sensitive collation.

## Deterministic outputs

Target determinism belongs to the package producing the target. Import emits the same editable
TypeScript content for the same accepted definition and canonical source identifiers. SVG renders
the same markup for the same accepted definition and options. Neither operation may depend on
locale, current time, random values, process state, platform paths, filesystem enumeration, DOM
state, or uncontrolled mutable registries.

Import emission has no generated ownership or persistence lifecycle. A host decides whether and
where to retain an emitted module. SVG similarly returns complete markup without filesystem or DOM
authority.

## Verification

Current conformance evidence covers malformed and unsafe sources, exact spans, deterministic
diagnostic aggregation, warning-bearing accepted Illustrator input, atomic single and batch
adoption, editable TypeScript emission, repeated SVG rendering, and equivalent TypeScript-first
and Import-adopted definitions through public package roots.
