# Manual Publication

Status: **Candidate procedure; no npm publication has occurred**.

This is the human-controlled procedure for the first public `0.1.0` release of Core, Icons, SVG
and CLI. The [versioning policy](versioning.md) owns compatibility and dependency sequencing;
each package owns its [release notes](../packages/index.md). Private `@aster/import` participates
in repository verification but must not be packed or published as part of this release.

## Decision boundary

CI checks the source and packed-consumer contracts; a green check is necessary evidence, not
authorisation to publish. A maintainer explicitly reviews the exact commit, package contents,
artwork and software notices, release notes, npm scope permissions, and the final tarball hashes.
They then decide go or no-go. No push, merge, tag, version script, CI job, or Conventional Commit
title triggers a registry write. Garden's ecosystem record is maintained through a separate,
manually reviewed change only when the release materially affects it.

The proposed first-publication dist-tag is `next` so a new pre-1.0 candidate is not implicitly
presented as `latest`. Confirm that choice in the go/no-go decision. Consumers use explicit
`@0.1.0` versions until a separate human decision promotes a tag. npm's default publish tag is
`latest` unless a tag is supplied; the commands below therefore always specify `--tag next`.
See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) and
[dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).

## Prepare the candidate

Use Node `24.10.0` and pnpm `10.28.1` from a clean, reviewed Git revision. Inspect
`git status --short` and do not package unreviewed local modifications. The complete verification gate also
exercises packed consumer behaviour from clean temporary projects.

```sh
node --version
pnpm --version
git status --short
pnpm install --frozen-lockfile
pnpm run verify
```

Choose a new absolute directory outside the repository for release artefacts. In PowerShell, set
`$releaseDir` to that directory before the commands below; `pnpm pack` must produce the four
expected files. Dry-run inventory and actual pack are separate checks:

```powershell
$releaseDir = "C:\absolute\path\to\aster-release-0.1.0"
New-Item -ItemType Directory -Path $releaseDir

pnpm --dir packages/core pack --dry-run --json
pnpm --dir packages/icons pack --dry-run --json
pnpm --dir packages/svg pack --dry-run --json
pnpm --dir packages/cli pack --dry-run --json

pnpm --dir packages/core pack --pack-destination "$releaseDir"
pnpm --dir packages/icons pack --pack-destination "$releaseDir"
pnpm --dir packages/svg pack --pack-destination "$releaseDir"
pnpm --dir packages/cli pack --pack-destination "$releaseDir"
```

Inspect each resulting `aster-{core,icons,svg,cli}-0.1.0.tgz` rather than assuming the workspace
manifest is what npm will receive. Check the packaged `package.json`, README, notices, exports,
CLI binary, and dependency ranges. Core must have no production dependency; Icons and SVG must
depend on Core `^0.1.0`; CLI must depend on Core, Icons and SVG `^0.1.0`. Every archive must
contain only its `dist/`, `package.json`, `README.md`, `LICENSE`, and, for Icons,
`ARTWORK-LICENCE.md`. There must be no `workspace:` range, private Import, tests, credentials,
tooling, or source tree. Record a SHA-256 digest for each final archive and do not repack between
approval and publication. Use the same tarballs for dry-run and live commands.

```powershell
Get-ChildItem -LiteralPath $releaseDir -Filter "*.tgz" | Get-FileHash -Algorithm SHA256
tar -tf "$releaseDir/aster-core-0.1.0.tgz"
tar -xOf "$releaseDir/aster-core-0.1.0.tgz" package/package.json
```

Repeat the archive inspection for Icons, SVG and CLI.

The [package quality records](../packages/index.md) describe local conformance evidence, but
the release approver must repeat it for the final candidate. A package name/version cannot be
reused after publication, even if later unpublished; a changed tarball needs a new approval and,
if already published, a new version. See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/).

## Check registry access

Before publishing, inspect the selected registry and authenticated identity:

```sh
npm config get registry
npm whoami --registry=https://registry.npmjs.org/
npm view @aster/core@0.1.0 version --registry=https://registry.npmjs.org/
npm view @aster/icons@0.1.0 version --registry=https://registry.npmjs.org/
npm view @aster/svg@0.1.0 version --registry=https://registry.npmjs.org/
npm view @aster/cli@0.1.0 version --registry=https://registry.npmjs.org/
```

The registry must be `https://registry.npmjs.org/` for these commands. Confirm through the npm
account or organisation controls that the publisher owns or may publish under `@aster` and that
the four names are eligible. `whoami` proves authentication, not scope authority. A not-found
response from `npm view` does not grant ownership or prove that a name is available. An existing
`0.1.0` is a stop condition, not a prompt to overwrite it. Do not put credentials in repository
files or CI variables for this manual procedure. Use interactive npm authentication and required
two-factor authentication; never paste an OTP or token into logs or a pull request. See npm's
[scoped public package guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
and [publishing authentication policy](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/).
If `whoami` reports no authenticated session, sign in interactively with
`npm login --registry=https://registry.npmjs.org/`, then repeat `whoami` and the scope permission
check before proceeding.

## Dry-run and publish

Run every dry-run against its approved archive. `--access public` is explicit for these scoped
packages; `--tag next` prevents an accidental `latest` tag. A dry-run is not publication.

```powershell
npm publish "$releaseDir/aster-core-0.1.0.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-icons-0.1.0.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-svg-0.1.0.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-cli-0.1.0.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
```

Stop for explicit human go/no-go after comparing the dry-run file lists, archive hashes, release
notes, rights, and registry access. If approved, publish the same tarballs in dependency order:

```powershell
npm publish "$releaseDir/aster-core-0.1.0.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-icons-0.1.0.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-svg-0.1.0.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/aster-cli-0.1.0.tgz" --access public --tag next --registry=https://registry.npmjs.org/
```

Stop on the first failure. Do not publish a dependent package before its required predecessors
are visible at the approved versions. Do not switch to `latest`, change a version, or rebuild an
archive to recover silently; re-assess the remaining release with a maintainer. There is no
automatic rollback of already published packages.

## Verify the published result

After registry propagation, inspect each published version, dependency map and dist-tags:

```sh
npm view @aster/core@0.1.0 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @aster/icons@0.1.0 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @aster/svg@0.1.0 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @aster/cli@0.1.0 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
```

In a fresh external project without workspace links, install exact versions from npm, not the
local tarballs. After initialising that project, run:

```sh
pnpm add @aster/core@0.1.0 @aster/icons@0.1.0 @aster/svg@0.1.0
pnpm add -D @aster/cli@0.1.0
pnpm exec aster version
pnpm exec aster list icons
```

Repeat the package README examples to verify a Core definition, isolated Icons import, and SVG
render under Node `>=24.10.0 <25`. Confirm the intended `next` tag and accessible README/licence
notices on the npm pages. Only then record the actual publication date, artefact hashes and
registry links in the package release notes and update candidate-only wording. An unpublished
candidate must never be described as available from npm.
