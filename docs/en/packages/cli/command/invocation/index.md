# CLI Command Invocation

Status: **Experimental**

The invocation subfeature accepts untrusted programmatic command values and produces either one
canonical immutable invocation or one structured usage rejection. It remains host-neutral and
does not parse argv, load catalogue providers, execute commands, or present output.

## Composition

`CommandInvocationNormaliser` is a narrow dispatcher composed explicitly by the package API root.
It receives one `ICommandInvocationNormaliser` for each supported command and indexes those
collaborators by their unique command identity. Duplicate identities fail during composition;
there is no mutable registry, reflection, or automatic command discovery.

| Class | Accepted family |
| --- | --- |
| `ExportInvocationNormaliser` | Exact icon or collection export requests and portable render options. |
| `ListInvocationNormaliser` | Catalogue, collection, and icon listing requests. |
| `SearchInvocationNormaliser` | Search queries and optional discovery filters. |
| `ShowInvocationNormaliser` | Exact icon or collection lookup requests. |
| `HelpInvocationNormaliser` | General or command-specific help requests. |
| `VersionInvocationNormaliser` | Version requests without additional fields. |

`InvocationFilterNormaliser` owns the shared provider, collection, and tag filter grammar.
`InvocationRejectionFactory` constructs canonical usage failures without coupling the normalisers
to command execution.

## Acceptance boundary

The dispatcher inspects only the own enumerable data property named `command`. It does not execute
getters or inspect unrelated command fields before selecting the owning normaliser. Each selected
normaliser then validates the complete command-specific shape, rejects unknown fields, copies
retained values, and freezes every accepted sequence and record.

Adding a command requires an invocation normaliser, a command definition, explicit composition at
the API root, and any standalone parser or presenter required by that command. Existing
command-specific normalisers do not change unless their own grammar changes.

Execution after acceptance is documented by [Command Runtime](../runtime/index.md).
