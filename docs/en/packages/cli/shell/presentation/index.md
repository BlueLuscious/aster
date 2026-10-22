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

## Successful Output

Sequences use a heading and one entry per line, with two spaces per ownership level. Every line
of a nested entry receives its enclosing indentation. An absent optional sequence or an empty
array is shown as one indented `(none)`; the structured result retains their distinction.
Preserve canonical result order and declared member order without truncation or hard wrapping.

Exact icon and collection details retain their identity, provider and display name, with vertical
`Tags:`, `Collections:` or `Icons:` sequences as applicable. Collection members are concrete icon
identities, not glyph names. Icon list/search entries and glyph-show variants place a nested
`Collections:` sequence beneath each concrete summary. Search retains its `icon:` / `collection:`
distinction. Catalogue and collection list summaries remain compact scalar/count entries.

Glyph listing retains each family identity, provider and treatment count, followed by the complete
nested `Variants:` sequence. It does not invent family-level display names or icon metadata:

```text
Glyphs:
  aster/camera [aster] (1 variant)
    Variants:
      outline
```

Exact glyph show uses `Glyph:`, `Catalogue:` and a `Variants:` sequence of concrete summaries.
[Catalogue](../../catalogue/index.md#discovery-semantics) owns discovery and identity semantics.

Product and named-package versions remain compact. Dependency roots are indented beneath their
source heading, with direct dependencies or `(none)` indented one further level. Separate root
groups and requested CLI-location evidence by one blank line. Location comparison wording and
opt-in acquisition are unchanged by presentation. Help retains its command, description and usage
hierarchy. Export/Review retain truthful compact publication summaries; single-artefact Export
returns raw SVG rather than an indented sequence. Presentation does not change SVG or review HTML.

## Human Data Representation

Dynamic human values containing C0/C1 controls, DEL or Unicode line/paragraph separators are
quoted with visible JSON-compatible escapes. A newline inside a value appears as `\n`, not as
another output line. This applies to display names, help data, versions, location/destination
paths and diagnostic messages/details. Ordinary printable text, Unicode and Windows path
separators remain unchanged; structural line breaks remain real line breaks.

This is display representation, not domain validation or a general Unicode-spoofing defence.
Structured results and compact JSON retain the original data. Raw SVG and generated HTML are
not passed through human text escaping. Output is independent of terminal width, TTY detection,
ANSI support and redirection; presentation never acquires additional capabilities.

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

Messages and labelled facts use the shared [human data representation](#human-data-representation).
The structured diagnostic and compact JSON retain the complete original message and typed details.

## Internal types

| Type | Responsibility |
| --- | --- |
| `TCataloguePayload` | Narrows the public payload union to catalogue list, search, and show results accepted by human catalogue presentation. |
| `TShellExecution` | Describes complete stdout, stderr, and exit-status effects selected before the executable writes process state. |

`TShellExecution` contains complete strings, including final newlines, so presentation remains a
pure planning boundary rather than a partial stream writer.
