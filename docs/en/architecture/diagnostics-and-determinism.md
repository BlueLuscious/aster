# Diagnostics and Determinism

Status: **Accepted**

This document defines stable source diagnostics and environment-independent generation. It applies
to metadata and SVG processing without exposing parser- or filesystem-specific errors.

## Diagnostic shape

One source diagnostic contains:

| Field | Meaning |
| --- | --- |
| `code` | Stable Aster-owned identifier. |
| `severity` | `error` or `warning`. |
| `category` | Syntax, Safety, Technical, Collection, or Generation. |
| `message` | Deterministic British English explanation without environment-specific text. |
| `sourceId` | Repository-relative logical source identifier using `/` separators. |
| `span` | Start and end offsets plus human-readable line and column positions when available. |
| `related` | Optional ordered locations needed to explain a collision or relationship. |

Codes use `ASTER-<CATEGORY>-<NUMBER>`, for example `ASTER-SAFETY-001`. Once published, a code keeps
the same semantic meaning. External parser codes and messages are mapped to Aster-owned
diagnostics.

Absolute paths, stack traces, platform error text, timestamps, process identifiers, and parser
implementation names cannot enter stable diagnostics.

## Locations

Offsets count UTF-16 code units in the decoded source string and are zero-based. Lines and columns
are one-based for display. End offsets are exclusive.

Source decoding is UTF-8. A byte-order mark may be accepted only through one documented decoding
rule. CRLF and LF each count as one logical line ending. Invalid decoding is a syntax error located
at the earliest determinable position.

A diagnostic without a trustworthy source span may identify the complete source. Fabricated
precision is not permitted.

## Severity and category

Errors block the affected definition and generated output. Warnings preserve accepted output but
remain observable to callers and verification.

| Category | Responsibility |
| --- | --- |
| Syntax | Malformed XML, metadata, numbers, points, path data, or enumeration values. |
| Safety | Executable, external, foreign, raster, embedded, or resource-exhaustion risks. |
| Technical | Unsupported source features, invalid portable geometry, or identity disagreement. |
| Collection | Curatorial quality advice or an evidenced collection rule. |
| Generation | Name collisions, invalid output plans, or deterministic-output violations. |

Safety failures are always errors. Unsupported required syntax is a Technical error. Collection
quality advice is a warning unless an accepted collection contract explicitly makes the rule
blocking.

Unexpected implementation failures are not converted into misleading source diagnostics. They
terminate the operation through the internal failure boundary and cannot commit generated output.

## Deterministic ordering

Diagnostics use this ascending order:

1. canonical `sourceId`;
2. start offset;
3. end offset;
4. errors before warnings at the same span;
5. category;
6. code;
7. stable encounter index for otherwise identical diagnostics.

Related locations have their own deterministic order. Filesystem enumeration, asynchronous
completion, map insertion from uncontrolled input, and external parser order cannot alter the
observable sequence.

Duplicate diagnostics with the same code, source, span, and semantic cause are reported once.
Distinct occurrences remain distinct.

A diagnostic without a span identifies the complete source and sorts with start and end offset
`-1`, before located diagnostics for the same `sourceId`. Text comparison uses Unicode code-unit
order rather than locale-sensitive collation.

## Deterministic generation

Identical acquired SVG bytes, metadata values, collection rules, generator version, and explicit
generation options must produce byte-identical output.

Generated output uses:

- UTF-8 encoding without an environment-dependent byte-order mark;
- LF line endings;
- canonical logical identity order;
- stable node, field, import, export, and manifest order;
- canonical numeric and string escaping rules;
- explicit filenames derived from accepted identity;
- an Aster-owned formatter or template whose version is part of generation authority.

Generated output cannot contain timestamps, absolute paths, random values, locale-sensitive text,
machine names, platform separators, nondeterministic hashes, or uncontrolled environment values.
Content digests use one explicitly selected algorithm and canonical byte input.

The generator validates the complete plan before committing files. Existing stale files are
removed only inside the declared generated root, and source errors cannot produce a partially
accepted generation.

## Verification

Conformance evidence must cover:

- repeated generation in one environment;
- generation from different filesystem enumeration orders;
- LF and CRLF source handling;
- stable diagnostics after asynchronous processing;
- clean deletion and deterministic rebuild of generated artefacts;
- equivalent results on every supported operating system;
- rejection without committed output for unsafe or invalid source.
