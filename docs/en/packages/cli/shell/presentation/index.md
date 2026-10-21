# CLI Shell Presentation

Status: **Accepted**

The presentation subfeature converts an immutable command result and optional publication
evidence into complete deterministic stream content and an exit status. It does not parse argv,
execute commands, or perform filesystem operations.

## Composition

`CommandOutputPresenter` selects human or JSON presentation. `JsonOutputPresenter` emits one
compact structured result document. `HumanOutputPresenter` exhaustively dispatches successful
payloads to command-family collaborators:

| Class | Responsibility |
| --- | --- |
| `CatalogueHumanOutputPresenter` | Presents catalogue, collection, glyph, icon, search and show payloads. |
| `ExportHumanOutputPresenter` | Presents raw icon SVG, export plans, and truthful publication summaries. |
| `ReviewHumanOutputPresenter` | Presents deterministic headless plan summaries and committed or replaced review destinations. |
| `HelpHumanOutputPresenter` | Presents canonical command descriptors and usage forms. |
| `HumanOutputPresenter` | Also formats product/package versions, separate dependency-root groups and optional CLI-location evidence. |
| `HumanTextFormatter` | Formats shared counts, deterministic sequences and visible human data values. |
| `ShellIdentityFormatter` | Formats portable glyph, collection and concrete icon identities. |

Expected human failures retain stable diagnostic codes and messages with the
[evidence presentation](#diagnostic-evidence) below. JSON mode writes the same structured command
result to stdout and writes nothing to stderr. Presentation returns
complete strings before the entrypoint performs process writes, so it cannot alter command
behaviour or partially emit a result. Exact framing, headings and statuses belong to
[Shell](../index.md#presentation); presenters never acquire version evidence themselves.

Glyph listing uses `Glyphs:` with ordinary indented entries or `  (none)`. A summary such as
`aster/camera [aster] (1 variant: outline)` reports only family identity, provider and treatments.
Exact show uses `Glyph:`, `Catalogue:` and a `Variants:` sequence of existing concrete icon
summaries. JSON retains the structured `glyph-list`/`glyph-show` payload rather than introducing
a separate display schema. [Catalogue](../../catalogue/index.md#discovery-semantics) owns semantics.

## Diagnostic Evidence

Human failures show the stable diagnostic code and explanation, followed by `Details:` only when
the diagnostic carries supporting facts. The [command contract](../../command/index.md#diagnostic-details)
owns the detail shapes and their code/category relationships. Human presentation uses their explicit
roles, not message matching or array positions; these facts are not suggested matches.

Fields use two spaces beneath `Details:`. Labels include `Catalogue:`, `Icon:`, `Glyph:`,
`Collection:`, `Member icon:` and `Artefact path:` according to their role. Provider lists use
`Catalogues:` beneath `Details:`, with one provider per line indented another two spaces.
Preserve evidence order and repeated received provider claims without sorting or deduplication.
A known failing collection member is shown only when supplied by its producer. For example:

```text
[ASTER-CLI-006] icon example/camera@outline loader returned metadata inconsistent with discovery
Details:
  Catalogue: testing
  Collection: example/set
  Member icon: example/camera@outline
```

The headline may contain a value also present in a labelled field; presentation does not hide
facts by recognising that repetition. Families without supporting details have no extra block.

Diagnostic messages and detail values containing C0/C1 controls, DEL or Unicode line/paragraph
separators are quoted with visible JSON-compatible escapes. For example, a newline inside a value
appears as `\n`, not as another output line. Ordinary printable text, Unicode and Windows path
separators remain unchanged; the presenter's structural line breaks remain real line breaks.
This is a human representation, not domain validation or a general Unicode-spoofing defence.

The structured diagnostic and compact JSON retain the complete original message and typed
details, including controls. Presentation neither mutates these values nor acquires additional
provider, definition or filesystem capabilities.

## Internal types

| Type | Responsibility |
| --- | --- |
| `TCataloguePayload` | Narrows the public payload union to catalogue list, search, and show results accepted by human catalogue presentation. |
| `TShellExecution` | Describes complete stdout, stderr, and exit-status effects selected before the executable writes process state. |

`TShellExecution` contains complete strings, including final newlines, so presentation remains a
pure planning boundary rather than a partial stream writer.
