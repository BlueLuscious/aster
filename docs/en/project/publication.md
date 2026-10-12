# Manual Publication

Status: **Accepted**

This procedure governs maintainer-approved npm publication and subsequent package-specific
GitHub Releases. [Versioning](versioning.md) owns compatibility and dependency sequencing;
[publication records](publications/index.md) retain dated results. Private Import participates in
repository verification but is not published.

## Distribution channels

npm is the primary registry. Candidates use `next`; stable versions use `latest`. A stable version
is a separately reviewed package identity, not a candidate relabelled through a dist-tag.
Inspect the actual registry tags after publication.

After verified stable npm publication, each affected public package receives its own GitHub tag
and Release. The tag is `<package>/v<version>` at the approved source commit; different packages
may share a commit without sharing a version sequence. GitHub's repository-wide Latest label
does not select the latest version of each package.

Attach the exact approved npm `.tgz`, not rebuilt bytes or GitHub's generated source ZIP/tar
archives. [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
and [GitHub Packages](../future-capabilities.md#additional-package-registry) are different channels;
the additional registry remains conditional.

## Decision boundary

A maintainer reviews the exact source, versions, dependency set, notices, notes, package contents,
registry authority and archive hashes before giving an explicit go/no-go. Passing CI is evidence,
not permission to publish. Pushes, merges, tags and Conventional Commit titles do not publish to
npm or publish GitHub Releases.

Approval applies only to the identified packages and archives. A failure stops the remaining
operation for inspection; do not silently rebuild, change a version/tag, overwrite a draft or
roll back already published packages. Ecosystem-documentation updates remain separate reviewed
changes under the [project authority](index.md#ecosystem-authority).

## Branch promotion

Maintenance and feature changes may accumulate on `develop` through reviewed pull requests with
green CI. At the release decision, accept the affected versions and evidence, promote the reviewed
source to `master` and require green Ubuntu and Windows CI there as well.

Generate new archives from a clean checkout of that approved `master` revision, never from
unreviewed local modifications or bytes produced before final promotion. Repacking requires new
hashes and archive review. Reused published dependencies retain their original approved source
and hash; they do not become artefacts of the new commit.

## Prepare the archives

Use the [configured toolchain and root gate](../tooling/index.md), inspect the source revision and
worktree, then perform the frozen installation and complete verification:

```sh
git rev-parse HEAD
git status --short
pnpm install --frozen-lockfile
pnpm run verify
```

For each selected public package, set `$packageDir` to its repository directory and
`$releaseDir` to a new absolute artefact directory outside the checkout. Create that directory,
then pack only the reviewed package:

```powershell
pnpm --dir $packageDir pack --dry-run --json
pnpm --dir $packageDir pack --pack-destination $releaseDir
```

Set `$archivePath` to the resulting archive's full path. Inspect its actual manifest, file list,
exports, declarations, binary mapping, README, licences and resolved dependency ranges:

```powershell
tar -tf $archivePath
tar -xOf $archivePath package/package.json
Get-FileHash -LiteralPath $archivePath -Algorithm SHA256
```

Approved contents are `dist/`, `package.json`, `README.md`, `LICENSE` and, for Icons,
`ARTWORK-LICENCE.md`. Reject unresolved `workspace:` ranges, private packages, source trees,
tests, tooling or credentials. Exercise the applicable packed consumers and retain the final
SHA-256. Do not repack between approval and publication.

## Check registry access

Use interactive npm authentication and the account's required two-factor authentication.
`npm whoami --registry=https://registry.npmjs.org/` proves identity, not authority to publish
under `@luscious-garden`; inspect the account/organisation permissions separately. Never put
tokens or OTPs in repository files, command logs or pull requests. See
[npm's publishing authentication policy](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/).

Confirm that the exact intended name/version has not already been published and that all reused
dependencies are available at the approved versions. A not-found response does not prove scope
ownership or eligibility. Published identities cannot be reused, even after unpublishing; changed
bytes require a new version and approval.

## Dry-run and publish

Set `$tag` to the reviewed channel (`next` for a candidate, `latest` for stable) and inspect a
dry-run of the exact approved archive:

```powershell
npm publish $archivePath --dry-run --access public --tag $tag --registry=https://registry.npmjs.org/
```

A dry-run does not publish. After explicit approval, run the same command without `--dry-run`,
in the dependency order defined by [versioning](versioning.md#dependency-coordination).
Wait until each required predecessor is visible before publishing its dependants. Stop on the
first failure; there is no automatic rollback. See
[npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/).

## Verify the published result

Read the exact published version, dependency map and actual dist-tags; do not infer success from
a processing notice or the registry website. Download the npm archive and compare its SHA-256
with the approved bytes.

In a fresh external consumer without workspace links or npm credentials, install the exact
reviewed package combination from npm and exercise applicable package examples and CLI workflows.
Compare installed versions through the documented
[CLI shell source-selection rules](../packages/cli/shell/index.md), not an ambient global binary.

Record the npm URL, publication date, source and approved hash with the package's
[version notes](../packages/index.md). Record combination-level consumer verification and dated
channel observations in [publication evidence](publications/index.md).

## Prepare and publish GitHub Releases

After stable npm verification, use the [release tooling guide](../tooling/release/index.md) to
prepare one package's intent without writes. Review its exact tag, source, title, transformed
notes and npm archive. A first explicit approval allows the manual Action to create only that tag
and a draft with the verified archive; it never publishes the Release.

Review the draft's target, title, body, classification and asset before a second explicit
approval to publish it manually. Approval for one package does not approve the others.
After publication, download the asset again, compare its hash and record its URL in the owning
package's release index. Preserve partial state for inspection rather than replacing it.

## Third candidate artefact

CLI `0.1.0-rc.3` delegates its historical archive evidence to the
[third candidate publication record](publications/0.1.0-rc.3.md).
