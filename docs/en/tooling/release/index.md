# Release Tooling

Status: **Preparation implemented; no GitHub tag, draft or Release created**

This private tooling prepares one public package Release at a time. It neither selects a new
package version nor publishes to npm. The [publication policy](../../project/publication.md)
owns the human approval sequence; each package's version page owns its title, notes, source
commit and approved archive hash.

## Read-only preparation

Run `pnpm run release:prepare -- core 0.1.0`, replacing the package and version as needed. The
command reads the canonical version page, the package manifest at its recorded source commit,
the exact public npm archive, and the source commit's `master` push CI run. It requires successful
Ubuntu and Windows jobs, recomputes the archive SHA-256, and rejects an existing Git tag or
published GitHub Release. The JSON output contains the proposed tag, title, GitHub-ready notes,
archive URL and name, approved hash, direct runtime dependencies and CI evidence. Documentation
links in the GitHub-ready body point to the current canonical pages; the tag still points to the
approved package source commit. `approvalSha256` binds the proposed tag, title, notes, source,
archive name, archive URL and archive hash into one exact approval value.

Ordinary preparation performs no registry or GitHub write and needs no GitHub token for this
public repository. Its `draftInspection: "not-visible"` field is intentional: GitHub does not
expose unpublished drafts to a token without push access. It is not proof that no draft exists.
The `--full` option additionally checks push-visible release listings and returns
`draftInspection: "complete"` only when the token has repository push access and no matching
draft exists. Supply a suitable `GH_TOKEN` or `GITHUB_TOKEN` through the environment; never put
a token in a command argument or committed file.

## Manual Action

The `Package GitHub Release` workflow accepts only manual dispatch from `master`:

- `prepare` runs with read-only contents and Actions permissions. Review its JSON artifact and
  compare the proposed package, source commit, title, notes, tarball and SHA-256 with the
  [package release history](../../packages/index.md). This mode never creates a tag or draft.
- `draft` is the first write approval for one package. Enter the exact approved full source SHA,
  archive SHA-256, `approvalSha256` and `CREATE_DRAFT` confirmation. Its narrowly permissioned job
  repeats preparation with draft visibility, verifies those inputs, downloads and hashes the npm
  archive again, and
  calls `gh release create --draft` with that exact archive. It then reads back the tag target,
  draft classification, title, body and asset digest. A failure leaves any partial tag or draft
  visible for inspection; it does not repair or delete it automatically.

The workflow never publishes a Release or pushes to npm. Publishing a reviewed draft requires
a separate human decision per package. After publication, download its asset, compare its hash
with the version page and add the Release URL to the package's release index. GitHub's
repository-wide `Latest` label does not determine a package's latest version.

The draft job uses `contents: write` and `actions: read` only after manual dispatch. A tag
created by that job is not expected to trigger another CI run; preparation checks the already
approved source commit's CI explicitly.
