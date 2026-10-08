# Release Tooling

Status: **Preparation and draft creation verified for four package-specific `0.1.0` Releases**

This private tooling prepares one public package Release at a time. It neither selects a new
package version nor publishes to npm. The [publication policy](../../project/publication.md)
owns the human approval sequence; each package's version page owns its title, notes, source
commit and approved archive hash.

## Read-only preparation

Run `pnpm run release:prepare -- <package> <version>` with the exact reviewed package and version
before its Git tag or Release exists. The command reads the canonical version page, the package
manifest at its recorded source commit, the exact public npm archive, and the source commit's
`master` push CI run. It requires successful Ubuntu and Windows jobs, recomputes the archive
SHA-256, and rejects an existing Git tag or
published GitHub Release. The JSON output contains the proposed tag, title, GitHub-ready notes,
archive URL and name, approved hash, direct runtime dependencies and CI evidence. Documentation
links in the GitHub-ready body point to the current canonical pages; the tag still points to the
approved package source commit. `approvalSha256` binds the proposed tag, title, notes, source,
archive name, archive URL and archive hash into one exact approval value.

Ordinary preparation performs no registry or GitHub write and needs no GitHub token for this
public repository. Its `releasePreflight: "public"` field means it checked the direct tag and
Release endpoints but did not enumerate Releases; this is not proof that no draft exists. The
`--full` option also checks the authenticated
Release listing and returns `releasePreflight: "authenticated"` when that request succeeds
without a visible match. GitHub may omit drafts from a listing for some credentials, so neither
value proves that no draft exists. The write operation must still rely on GitHub rejecting an
existing tag or Release rather than treating an empty listing as permission to overwrite one.
Supply `GH_TOKEN` or `GITHUB_TOKEN` through the environment for `--full`; never put a token in a
command argument or committed file.

## Manual Action

The `Package GitHub Release` workflow accepts only manual dispatch from `master`:

- `prepare` runs with read-only contents and Actions permissions. Review its JSON artifact and
  compare the proposed package, source commit, title, notes, tarball and SHA-256 with the
  [package release history](../../packages/index.md). This mode never creates a tag or draft.
- `draft` is the first write approval for one package. Enter the exact approved full source SHA,
  archive SHA-256, `approvalSha256` and `CREATE_DRAFT` confirmation. Its narrowly permissioned job
  repeats authenticated preparation, verifies those inputs, downloads and hashes the npm archive
  again, and creates the approved tag at the exact source commit. It creates a new draft through
  GitHub's Release API without asking GitHub to create or move a tag, then uploads the archive
  through the `upload_url` returned by that creation. It reads the resulting draft back by its
  numeric ID and verifies the tag target, classification, title, body and asset digest. This
  avoids relying on a by-tag draft lookup that may be hidden from the Actions token. A conflicting
  or failed GitHub write stops the job; any partial tag or draft remains for inspection rather
  than being replaced or deleted.

The workflow never publishes a Release or pushes to npm. Publishing a reviewed draft requires
a separate human decision per package. After publication, download its asset, compare its hash
with the version page and add the Release URL to the package's release index. GitHub's
repository-wide `Latest` label does not determine a package's latest version.

The draft job uses GitHub's automatically provided `GITHUB_TOKEN` with `contents: write` and
`actions: read`; it needs no repository secret. A tag created by that job is not expected to
trigger another CI run; preparation checks the already approved source commit's CI explicitly.
If GitHub denies draft readback for this token, verification fails and the draft remains
unpublished for human inspection.
