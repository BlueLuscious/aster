# Manual Publication

Status: **Technical candidate reviewed; no npm publication has occurred**.

This is the human-controlled procedure for the first public `0.1.0-rc.1` release of Core, Icons, SVG
and CLI. The [versioning policy](versioning.md) owns compatibility and dependency sequencing;
each package owns its [release notes](../packages/index.md). Private `@luscious-garden/aster-import` participates
in repository verification but must not be packed or published as part of this release.

## Reviewed candidate

The first public set has four independently versioned `0.1.0-rc.1` packages. A frozen offline
workspace installation, complete repository verification, pack inventories and isolated
tarball-consumer tests passed on Node `24.10.0` with pnpm `10.28.1` after the npm-scope change.
The final approved commit still requires a clean checkout and the repeatable checks below;
local evidence alone is not a registry permission check.

| Package | Packed files | Production dependencies | Package release notes |
| --- | ---: | --- | --- |
| `@luscious-garden/aster-core` | 167 | None | [Core](../packages/core/releases.md) |
| `@luscious-garden/aster-icons` | 142 | Core `^0.1.0-rc.1` | [Icons](../packages/icons/releases.md) |
| `@luscious-garden/aster-svg` | 47 | Core `^0.1.0-rc.1` | [SVG](../packages/svg/releases.md) |
| `@luscious-garden/aster-cli` | 297 | Core, Icons and SVG `^0.1.0-rc.1` | [CLI](../packages/cli/releases.md) |

The archives contain emitted ESM and declarations, their manifests, READMEs and software
licences; Icons alone also includes the artwork licence. They exclude private Import, source
trees, tests, tooling and credentials. Icons carries a distinct artwork licence alongside ISC
software terms; the [package authority](../packages/icons/index.md#rights-boundary) explains the
scope. These counts are candidate evidence, not a promise that future versions retain identical
contents.

The maintainer reports creating the `luscious-garden` npm organisation, but authenticated publish
rights under `@luscious-garden` have not been verified. No live npm name availability has been
confirmed, and the maintainer has not given publication approval. The proposed `next`
tag also awaits confirmation. Specialist legal review remains optional if certainty about the
software/artwork boundary is required. These are explicit pre-publication decisions, not failed
source or packed-consumer checks.

## Decision boundary

CI checks the source and packed-consumer contracts; a green check is necessary evidence, not
authorisation to publish. A maintainer explicitly reviews the exact commit, package contents,
artwork and software notices, release notes, npm scope permissions, and the final tarball hashes.
They then decide go or no-go. No push, merge, tag, version script, CI job, or Conventional Commit
title triggers a registry write. Garden's ecosystem record is maintained through a separate,
manually reviewed change only when the release materially affects it.

The proposed first-publication dist-tag is `next` so a new pre-1.0 candidate is not implicitly
presented as `latest`. Confirm that choice in the go/no-go decision. Consumers use explicit
`@0.1.0-rc.1` versions until a separate human decision prepares the stable `0.1.0` release. npm's
default publish tag is `latest` unless a tag is supplied; the commands below therefore always
specify `--tag next`.
See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) and
[dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).

## Branch promotion

Complete the release-readiness work on its topic branch and merge it into `develop` only through
a reviewed pull request with green CI. After the candidate source and release evidence are
accepted, promote that exact reviewed revision to `master` and require green CI there as well.
Generate the final archives from a clean checkout of the approved `master` revision so the
published source baseline and the repository's production branch remain identical.

Do not publish archives produced before the final promotion, even when their contents appear
equivalent. Repacking changes the artefact under review and therefore requires new hashes and a
repeat of the dry-run inspection. Branch promotion, tagging and registry publication remain
separate human decisions; none follows automatically from a successful check.

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
$releaseDir = "C:\absolute\path\to\aster-release-0.1.0-rc.1"
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

Inspect each resulting `aster-{core,icons,svg,cli}-0.1.0-rc.1.tgz` rather than assuming the workspace
manifest is what npm will receive. Check the packaged `package.json`, README, notices, exports,
CLI binary, and dependency ranges. Core must have no production dependency; Icons and SVG must
depend on Core `^0.1.0-rc.1`; CLI must depend on Core, Icons and SVG `^0.1.0-rc.1`. Every archive must
contain only its `dist/`, `package.json`, `README.md`, `LICENSE`, and, for Icons,
`ARTWORK-LICENCE.md`. There must be no `workspace:` range, private Import, tests, credentials,
tooling, or source tree. Record a SHA-256 digest for each final archive and do not repack between
approval and publication. Use the same tarballs for dry-run and live commands.

```powershell
Get-ChildItem -LiteralPath $releaseDir -Filter "*.tgz" | Get-FileHash -Algorithm SHA256
tar -tf "$releaseDir/luscious-garden-aster-core-0.1.0-rc.1.tgz"
tar -xOf "$releaseDir/luscious-garden-aster-core-0.1.0-rc.1.tgz" package/package.json
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
npm view @luscious-garden/aster-core@0.1.0-rc.1 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-icons@0.1.0-rc.1 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-svg@0.1.0-rc.1 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-cli@0.1.0-rc.1 version --registry=https://registry.npmjs.org/
```

The registry must be `https://registry.npmjs.org/` for these commands. Confirm through the npm
account or organisation controls that the publisher may publish under `@luscious-garden` and that
the four names are eligible. `whoami` proves authentication, not scope authority. A not-found
response from `npm view` does not grant ownership or prove that a name is available. An existing
`0.1.0-rc.1` is a stop condition, not a prompt to overwrite it. Do not put credentials in repository
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
npm publish "$releaseDir/luscious-garden-aster-core-0.1.0-rc.1.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-icons-0.1.0-rc.1.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-svg-0.1.0-rc.1.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-cli-0.1.0-rc.1.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
```

Stop for explicit human go/no-go after comparing the dry-run file lists, archive hashes, release
notes, rights, and registry access. If approved, publish the same tarballs in dependency order:

```powershell
npm publish "$releaseDir/luscious-garden-aster-core-0.1.0-rc.1.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-icons-0.1.0-rc.1.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-svg-0.1.0-rc.1.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-cli-0.1.0-rc.1.tgz" --access public --tag next --registry=https://registry.npmjs.org/
```

Stop on the first failure. Do not publish a dependent package before its required predecessors
are visible at the approved versions. Do not switch to `latest`, change a version, or rebuild an
archive to recover silently; re-assess the remaining release with a maintainer. There is no
automatic rollback of already published packages.

## Verify the published result

After registry propagation, inspect each published version, dependency map and dist-tags:

```sh
npm view @luscious-garden/aster-core@0.1.0-rc.1 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-icons@0.1.0-rc.1 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-svg@0.1.0-rc.1 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-cli@0.1.0-rc.1 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
```

In a fresh external project without workspace links, install exact versions from npm, not the
local tarballs. After initialising that project, run:

```sh
pnpm add @luscious-garden/aster-core@0.1.0-rc.1 @luscious-garden/aster-icons@0.1.0-rc.1 @luscious-garden/aster-svg@0.1.0-rc.1
pnpm add -D @luscious-garden/aster-cli@0.1.0-rc.1
pnpm exec aster version
pnpm exec aster list icons
```

Repeat the package README examples to verify a Core definition, isolated Icons import, and SVG
render under Node `>=24.10.0 <25`. Confirm the intended `next` tag and accessible README/licence
notices on the npm pages. Only then record the actual publication date, artefact hashes and
registry links in the package release notes and update candidate-only wording. An unpublished
candidate must never be described as available from npm.

## Promote a stable release

Do not present the release candidate as stable merely by moving an npm dist-tag. A stable
`0.1.0` release is a different Semantic Versioning identity and requires a reviewed source
change that removes the `-rc.1` suffix from the five workspace package versions, updates public
dependency evidence to `^0.1.0`, and updates release notes and installation guidance. Repeat the
complete verification, clean tarball generation, hashes, registry checks and human go/no-go for
that exact stable commit. Publish the four new stable archives in dependency order under
`latest` only after the release candidate has been accepted. Import participates in the stable
source baseline but remains private and unpublished.
