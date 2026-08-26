# CLI Command Runtime

Status: **Experimental**

The internal runtime composes concrete responsibilities without exposing an implementation
subpath.

| Class | Responsibility |
| --- | --- |
| `CommandInvocationNormaliser` | Dispatches acceptance to explicit command-owned normalisers documented by [Command Invocation](../invocation/index.md). |
| `CommandContextNormaliser` | Validates explicit providers and product metadata, snapshots provider identities and load capabilities, rejects duplicate identities, and freezes the context container. |
| `CommandKernel` | Isolates descriptors, orders definitions, coordinates both normalisers, dispatches explicitly, and sanitises thrown definition failures. |
| `CommandDiagnosticFactory` | Constructs isolated deeply frozen command diagnostics. |
| `CommandResultFactory` | Constructs immutable closed success payloads and structured failures. |
| Command definitions | Bind immutable descriptors to export, list, search, show, help, and version behaviours. |

Export owns command-local selection and artefact-planning collaborators rather than adding that
grammar or target behaviour to the generic kernel. The explicit composition root registers the
definition like every other command; no mutable registry or reflection-based discovery exists.

## Execution flow

```text
candidate invocation ----> invocation dispatcher ----+
                                  |                   |
                                  v                   |
                         command-owned normaliser ----+
                                                      |
candidate context -------> context normaliser --------+--> explicit definition
                                                               |
                                                               v
                                                    structured immutable result
```

Invocation rejection occurs before context inspection. Context rejection occurs before handler
dispatch. A valid command without a composed definition returns a usage failure. A thrown handler
exception becomes `ASTER-CLI-999` with category `execution-failure`; the same sanitisation applies
to unexpected caller-controlled exceptions raised while inspecting invocation or context shape.
Native exception text is not retained.

Descriptors are copied from definitions, their usage sequences are frozen, and the resulting
sequence is ordered lexically by command identity. Reading descriptors executes no command or
provider.

Structured records accept only own enumerable data properties on ordinary or null-prototype
objects. Symbols, hidden fields, accessors, custom prototypes, unknown fields, sparse arrays, and
authored array state are rejected. Provider objects are treated separately as capabilities: the
normaliser snapshots their canonical identity and callable `load` member without executing
accessors, then invokes the accepted method with its original receiver. Provider results remain
untrusted data and cross the catalogue acceptance boundary before becoming command state.

The runtime imports no Node module and writes no output. The public frozen `AsterCommands`
composition delegates to this kernel; the standalone Node shell and independent programmatic
hosts adapt the same object.
