# CLI Command Invocation

Status: **Accepted**

The invocation subfeature accepts untrusted programmatic command values and produces either one
canonical immutable invocation or one structured usage rejection. It remains host-neutral and
does not parse argv, load catalogue providers, execute commands, or present output.

## Composition

`CommandInvocationNormaliser` is a narrow dispatcher composed explicitly by the package API root.
It receives one `ICommandInvocationNormaliser` for each supported command and indexes those
collaborators by their unique command identity. This private contract associates that identity
with `normalise(value)`, returning `TAcceptanceResult<AsterCommandInvocationType>`.
Duplicate identities fail during composition;
there is no mutable registry, reflection, or automatic command discovery.

| Class | Accepted family |
| --- | --- |
| `ExportInvocationNormaliser` | Exact icon or collection export requests and portable render options. |
| `ListInvocationNormaliser` | Catalogue, collection, glyph and icon listing requests; glyph filtering applies only to icons. |
| `SearchInvocationNormaliser` | Search queries and optional discovery filters. |
| `ShowInvocationNormaliser` | Exact glyph, icon or collection lookup requests. |
| `HelpInvocationNormaliser` | General or command-specific help requests. |
| `VersionInvocationNormaliser` | Plain or scoped version requests, optional direct-dependency groups, and opt-in executed-CLI location. |

`InvocationFilterNormaliser` owns shared provider, collection, glyph and tag filter acceptance.
`InvocationRejectionFactory` constructs canonical usage failures without coupling the normalisers
to command execution. It shares actionable identity grammar diagnostics across Show, Export and
Review; concrete icons require a treatment rather than silently selecting one.

Version scope acceptance uses the same immutable public package-selector authority as the shell.
The aggregate `all` discriminator is defined once for structured requests and adapted to the
standalone `--all` token; no runtime package is selected by an unchecked type assertion.
`dependencies: true` applies to any version scope, while `location: true` applies only to absent
or `cli` scope. The [Command](../index.md) document owns the evidence and result contracts.

## Acceptance boundary

Record and array inspection follows the [shared data boundary](../../shared/index.md).
The dispatcher inspects only the own enumerable data property named `command`. It does not execute
getters or inspect unrelated command fields before selecting the owning normaliser. Each selected
normaliser then validates the complete command-specific shape, rejects unknown fields, copies
retained values, and freezes every accepted sequence and record.

Adding a command requires an invocation normaliser, a command definition, explicit composition at
the API root, and any standalone parser or presenter required by that command. Existing
command-specific normalisers do not change unless their own grammar changes.

Execution after acceptance is documented by [Command Runtime](../runtime/index.md).
