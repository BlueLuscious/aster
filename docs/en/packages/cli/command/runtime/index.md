# CLI Command Runtime

Status: **Experimental**

The internal runtime composes four concrete responsibilities without exposing an implementation
subpath.

| Class | Responsibility |
| --- | --- |
| `CommandInvocationNormaliser` | Validates, canonicalises, copies, and freezes one structured invocation. |
| `CommandContextNormaliser` | Validates explicit providers and product metadata, rejects duplicate provider identities, and freezes the context container. |
| `CommandKernel` | Isolates descriptors, orders definitions, coordinates both normalisers, dispatches explicitly, and sanitises thrown definition failures. |
| `CommandDiagnosticFactory` | Constructs isolated deeply frozen command diagnostics. |

## Execution flow

```text
candidate invocation ----> invocation normaliser ---+
                                                     |
candidate context -------> context normaliser -------+--> explicit definition
                                                               |
                                                               v
                                                    structured immutable result
```

Invocation rejection occurs before context inspection. Context rejection occurs before handler
dispatch. A valid command without a composed definition returns a usage failure. A thrown handler
exception becomes `ASTER-CLI-999` with category `execution-failure`; native exception text is not
retained.

Descriptors are copied from definitions, their usage sequences are frozen, and the resulting
sequence is ordered lexically by command identity. Reading descriptors executes no command or
provider.

The runtime imports no Node module and writes no output. A later public frozen composition will
delegate to the same kernel.
