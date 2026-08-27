# CLI Shell Presentation

Status: **Pre-release**

The presentation subfeature converts an immutable command result and optional publication
evidence into complete deterministic stream content and an exit status. It does not parse argv,
execute commands, or perform filesystem operations.

## Composition

`CommandOutputPresenter` selects human or JSON presentation. `JsonOutputPresenter` emits one
compact structured result document. `HumanOutputPresenter` exhaustively dispatches successful
payloads to command-family collaborators:

| Class | Responsibility |
| --- | --- |
| `CatalogueHumanOutputPresenter` | Presents catalogue, collection, icon, search, and show payloads. |
| `ExportHumanOutputPresenter` | Presents raw icon SVG, export plans, and truthful publication summaries. |
| `HelpHumanOutputPresenter` | Presents canonical command descriptors and usage forms. |
| `HumanTextFormatter` | Formats shared counts and deterministic sequences. |
| `ShellIdentityFormatter` | Formats portable provider, collection, and icon identities. |

Expected human failures retain stable diagnostic codes and related values. JSON mode writes the
same structured command result to stdout and writes nothing to stderr. Presentation returns
complete strings before the entrypoint performs process writes, so it cannot alter command
behaviour or partially emit a result.
