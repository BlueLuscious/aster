# Release Tooling

Status: **Accepted**

Private tooling prepares one public package Release at a time from an already published npm
archive. It does not select versions or publish to npm. [Publication policy](../../project/publication.md)
owns approval; [versioning](../../project/versioning.md#release-note-convention) owns note conventions.
Each version page owns its title, body, source commit and approved archive hash.
[Publication records](../../project/publications/index.md) retain completed distribution evidence.

## Composition

| Authority | Responsibility |
| --- | --- |
| `PackageReleasePreparer` | Reads canonical notes, Git source, npm bytes and GitHub state to produce a verified intent. |
| `releaseApprovalDigest` | Binds tag, title, body, source, archive name, URL and hash into one approval digest. |
| `ReleaseDraftMaterialiser` | Validates explicit approval against the intent, reacquires the archive and writes verified runner-local bytes. |
| `ReleaseDraftCreator` | Confirms the existing exact tag, creates a new draft and uploads one archive through its returned upload URL. |
| `ReleaseDraftVerifier` | Reads the draft by numeric ID and verifies classification, tag target, title, body and asset digest. |

Read-only Git, text and remote acquisition are explicit preparer capabilities. Draft creation
receives authenticated write authority separately; verification cannot publish or delete a Release.

## Read-only preparation

```sh
pnpm run release:prepare -- <package> <version>
```

Accepted selectors are `core`, `icons`, `svg` and `cli`; private Import is excluded.
Run before the package's tag or Release exists. Preparation reads the version page and manifest at
its recorded source commit, downloads the exact npm archive, recomputes SHA-256 and requires green
Ubuntu and Windows jobs in that commit's `master` push CI run. It rejects an existing tag or
published Release.

The JSON intent contains tag, title, GitHub-ready notes, source, archive identity, hash, direct
runtime dependencies, CI evidence and `approvalSha256`. Relative documentation links become
current canonical GitHub URLs; the tag still names the approved historical source.

Ordinary preparation performs no remote write and needs no token for this public repository.
`releasePreflight: "public"` means direct tag/Release endpoints were checked, not draft absence.
`--full` also checks an authenticated Release listing and returns
`releasePreflight: "authenticated"` on success. Credentials may not expose all drafts, so neither
mode proves absence. Writes rely on GitHub rejecting conflicts rather than permission to overwrite.
Supply `GH_TOKEN` or `GITHUB_TOKEN` through the environment, never arguments or committed files.

## Manual Action

The [Package GitHub Release workflow](../../../../.github/workflows/package-release.yaml) accepts
manual dispatch only from `master`:

- `prepare` uses read-only contents/Actions permissions and uploads the reviewable JSON intent.
  It creates neither tag nor draft.
- `draft` requires the approved full source SHA, archive SHA-256, intent digest and
  `CREATE_DRAFT`. Its write-scoped job repeats authenticated preparation and materialisation,
  creates the exact tag explicitly, creates a draft without implicit tag creation and uploads
  the verified archive. Numeric-ID readback verifies the result.

The draft job uses the automatically provided `GITHUB_TOKEN` with `contents: write` and
`actions: read`, without a repository secret. It checks existing source CI explicitly rather than
depending on a new run from its tag. A conflicting or failed write stops the job; partial tags or
drafts remain for inspection, without automatic replacement, deletion or publication.

## Human publication

The workflow has no publication operation. Review and publish each draft separately under
[publication policy](../../project/publication.md). Afterwards, download the public asset,
compare its hash with the version page and record its Release URL in the package history.
Repository-wide `Latest` is presentation, not a package-version authority.
