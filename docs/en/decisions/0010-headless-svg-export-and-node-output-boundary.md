# 0010: Headless SVG Export and Node Output Boundary

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-08-25**

Affected documents:

- [Command-line Boundary](../architecture/command-line-boundary.md)
- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Aster CLI](../packages/cli/index.md)
- [Future Capabilities](../future-capabilities.md)

Supersedes: **None**

Superseded by: **None**

## Context

The initial CLI discovers installed TypeScript-first icon and collection definitions through
explicit catalogue providers. Core and SVG now provide hardened portable construction and
deterministic standalone markup, but the CLI has no product workflow for turning a selected
definition into a consumable target artefact.

Adding export directly to the Node shell would duplicate catalogue selection and make the command
unusable by an independent host. Adding a filesystem writer to `AsterCommandContext` would make a
portable render plan depend on host effects even when a caller only needs SVG text. A generic
target registry would design compatibility for targets that do not exist.

## Decision drivers

- Export installed TypeScript-first definitions without depending on SVG ingestion or Build.
- Preserve the same command implementation for standalone and independent programmatic hosts.
- Keep filesystem, current-directory, process, and terminal authority outside the command kernel.
- Produce complete deterministic evidence before any optional host mutation.
- Prevent traversal, partial visible output, silent overwrite, and provider-controlled filenames.
- Reuse the hardened public SVG target without changing Core, Icons, or SVG responsibilities.
- Avoid a generic target or plugin abstraction before another implemented target requires one.

## Options

### Inject a filesystem output capability into every command context

This permits one handler to complete the whole workflow, but widens the public context for all
commands, couples pure programmatic export to effects, and makes output atomicity part of the
portable command contract.

### Render and write only inside the standalone Node shell

This keeps effects private, but duplicates selection and rendering outside the command set and
prevents an independent host from receiving the same export result.

### Return a headless artefact plan and let the shell optionally publish it

This preserves one selection and rendering implementation. Programmatic callers receive complete
artefacts, while the private Node shell may either present them or commit them under a separately
defined output policy.

## Decision

Add one `export` command to the host-neutral Aster command family. Its first and only target is
SVG. The command resolves either one exact icon or one exact collection from explicit catalogue
providers, renders through the public `@aster/svg` root, and returns one deeply immutable,
JSON-serialisable plan. The plan carries selected provider and subject evidence plus canonically
ordered artefacts containing logical relative path, `image/svg+xml` media type, and complete SVG
content.

`@aster/cli` gains a direct production dependency on `@aster/svg`. It does not receive a renderer
through `AsterCommandContext`, expose a target registry, or make SVG depend on the CLI. The command
context remains limited to catalogue providers and product metadata.

The accepted structured invocation selects `icon` or `collection`, one canonical identity, an
optional exact catalogue provider, and optional portable render values. Both subjects accept
`size`, `colour`, `fill`, `stroke`, `strokeWidth`, and `direction`. Icon export additionally
accepts `label` and `title`. Collection export cannot apply one accessible name to every member.
Output is decorative by SVG default when neither accepted accessible value is supplied. The CLI
does not derive accessibility text from display metadata.

The standalone grammar is:

```text
aster export icon <identity> [--catalogue <provider>] [render-options] [--output <root>]
aster export collection <identity> [--catalogue <provider>] [render-options] --output <root>
aster export icon <identity> [--catalogue <provider>] [render-options] --json
aster export collection <identity> [--catalogue <provider>] [render-options] --json
```

The accepted render options are `--size`, `--colour`, `--fill`, `--stroke`, `--stroke-width`,
`--direction`, and, for icon export only, `--label` and `--title`. Every option is a singleton.
`--direction` accepts the canonical `ltr` and `rtl` values. Paint and numeric acceptance delegates
to the same portable and SVG contracts used by programmatic rendering.

`--json` and `--output` are mutually exclusive shell options and do not enter the structured
invocation. Without either option, icon export writes exactly one complete SVG followed by one
newline to stdout. Collection export requires `--json` or `--output` because concatenated SVG
documents are not one accepted human result. JSON mode performs no filesystem mutation and emits
the ordinary structured command result including complete artefacts.

Logical artefact paths derive only from canonical icon identity. An optional namespace becomes a
directory segment; the icon name and optional `@variant` become the filename followed by `.svg`.
For example, `aster/camera@filled` becomes `aster/camera@filled.svg`. Provider identity, display
name, tags, aliases, and collection identity never affect the path. Equivalent paths within one
plan are an export conflict.

One exact collection resolves its member definitions from the same accepted provider snapshot.
Missing or inconsistent members fail the whole plan before rendering becomes observable. An empty
collection produces a successful empty plan. Publishing that plan performs no filesystem
mutation.

The private Node output host treats `--output` as a directory root. The root must not exist and the
first workflow provides no overwrite or force option. The host resolves the explicit root against
an explicitly supplied current directory, validates every logical segment, renders the complete
plan, stages one complete tree beside the target, and publishes it through one same-parent
directory rename. A caught failure removes only the current stage. A process interruption may
leave a private stage, but cannot expose the requested output root partially; Aster claims no
crash durability beyond that boundary and never removes an unknown stage automatically.

Expected export diagnostics extend the command family with stable render-failure,
export-conflict, output-conflict, and output-failure responsibilities. They receive codes
`ASTER-CLI-007` through `ASTER-CLI-010` respectively. Native SVG and filesystem exception text is
not a stable command message. Usage failures retain status `2`; every other expected export or
host failure retains status `1`; success retains status `0`.

The closed invocation and payload unions remain appropriate. The implementation may localise
command-specific parsing, normalisation, execution, and presentation behind explicit vertical
collaborators, but it does not introduce inheritance, automatic command discovery, a mutable
registry, or a generic plugin ABI.

## Consequences

### Positive

- Programmatic hosts receive the same deterministic export plan without Node or filesystem
  authority.
- The standalone shell can provide raw SVG, machine-readable plans, and safe directory output
  without duplicating catalogue or render logic.
- Every visible output tree is complete when first published and no existing root is overwritten.
- CLI export proves a real consumer relationship between the hardened Core, Icons, and SVG
  packages without changing their APIs.

### Negative

- Export plans retain complete SVG content and can make JSON results large for collections.
- Re-exporting to the same directory requires an explicit external cleanup or a future accepted
  replacement policy.
- Multi-target export requires a later decision because the first command intentionally owns SVG
  rather than a generic target abstraction.
- Process interruption can leave a private staging directory that requires explicit recovery.

### Deferred

- `add` requires an accepted package, import, or vendoring policy for consumer projects.
- `generate` requires one concrete manifest, wrapper, or integration generator contract.
- `review` requires a disposable evidence format and visual host.
- `import` remains conditional on the separate Build viability decision.
- Explicit selected-set export, overwrite, stale cleanup, target plugins, and command-package
  extraction require independent consumer evidence.

## Compatibility and migration

The extension is additive before a compatibility-bearing CLI release. Existing commands,
catalogue providers, context fields, results, JSON presentation, and process statuses retain their
semantics. The command-name, subject, invocation, payload, diagnostic, and help unions gain
explicit export members.

The CLI package gains `@aster/svg` as an ordinary runtime dependency. Core, Icons, SVG, Build,
framework adapters, and consumers do not gain a CLI dependency. A future command-package
extraction must preserve the root programmatic API or provide an explicit migration.

## Evidence

- [Command-line Boundary](../architecture/command-line-boundary.md)
- [SVG API](../packages/svg/api/index.md)
- [SVG Render Result](../packages/svg/render/index.md)
- [CLI Compatibility and Conformance](../packages/cli/compatibility.md)
- [Versioning and Releases](../governance/versioning-and-releases.md)

