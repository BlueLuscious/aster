# Manual Publication

Status: **`0.1.0-rc.1` and `0.1.0-rc.2` published; replacement candidate pending approval**.

This records the human-controlled procedure and evidence for both published candidate sets of
Core, Icons, SVG and CLI. The [versioning policy](versioning.md) owns compatibility and dependency
sequencing; each package owns its [release notes](../packages/index.md). Private
`@luscious-garden/aster-import` participated in repository verification but was not published.

The version-specific commands below record the completed `0.1.0-rc.2` procedure. They are not
commands for a future candidate: npm versions cannot be republished. A new candidate requires
its own reviewed package versions, archive paths, dependency ranges, hashes and human go/no-go.

## Distribution channels

npm remains the primary package distribution registry. Subsequent npm releases are accompanied
by a manually approved GitHub Release that records the exact published package versions, release
notes and reviewed source commit. This procedure does not establish that a companion GitHub
Release already exists for the historical npm publication recorded below.

A GitHub Release is based on a Git tag targeting the approved `master` commit; that tag is
independent from npm dist-tags such as `next` and `latest`. Mark a release containing candidate
packages as a pre-release. A coordinated release may list several independently versioned
packages without implying that every package shares one version.

Attach the same approved `.tgz` archives that were published to npm, together with their SHA-256
checksums. Do not rebuild or repack them for GitHub. GitHub's automatically generated source ZIP
and tar archives are not substitutes for the compiled npm package archives. See
[GitHub's release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

Confirm npm publication and registry-consumer verification for every package listed before
publishing its companion GitHub Release. Creating the tag, publishing the release and uploading
assets remain separately approved human operations; no workflow performs them automatically.
Record the release URL in the affected package release notes and verify that each downloaded
package asset matches its approved hash. Keep the release as a draft if publication is incomplete.

GitHub Packages is a different registry, not the release page. It is not part of the accepted
distribution procedure and does not block candidate or stable publication. A GitHub organisation,
repository transfer, second npm scope or registry-routing change is not required for the selected
npm-and-Releases path. Reconsider an additional registry only through the separately conditional
[future capability](../future-capabilities.md#additional-package-registry).

## First candidate review

The first public set has four independently versioned `0.1.0-rc.1` packages. A frozen offline
workspace installation, complete repository verification, pack inventories and isolated
tarball-consumer tests passed on Node `24.10.0` with pnpm `10.28.1` from clean commit
`7c7efd67d8f6f60204cfa268e0ce4fcf4b794df1`.

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

Authenticated registry checks identified `blue_luscious` as owner of the `luscious-garden` npm
organisation. The maintainer gave an explicit go decision after reviewing the final archives,
licence boundaries, commands and SHA-256 hashes. Publication completed in dependency order and an
external consumer without registry credentials installed all four exact versions, executed the
CLI, listed the complete icon catalogue and rendered an imported icon. Specialist legal review
remains optional if additional certainty about the software/artwork boundary is required.

## First candidate artefacts

| Package | Registry | SHA-256 |
| --- | --- | --- |
| Core | [`0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-core/v/0.1.0-rc.1) | `FA4C247160BB9556ABE2F78EFD7DFAED2FBE33B72471A1710FA0608144DDB59B` |
| Icons | [`0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-icons/v/0.1.0-rc.1) | `DDE0653DBD7C94E75E7FEA880C24ED1A641566DD077516650BA1AEEA8B2DEA63` |
| SVG | [`0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-svg/v/0.1.0-rc.1) | `C2FCD1EA1C64052486710F13AB49662184DDF61B7AE820B935BC948F1B140831` |
| CLI | [`0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.1) | `39E5C9A172CEDE79EDC20A13F4127EB702C1A1F0471CC5C8B4328CF74248D364` |

## Second candidate artefacts

The maintainer published the reviewed `0.1.0-rc.2` archives from `master` commit
`a0815e2f53fc99a98462ac3a88d05e36782224c5` on 6 October 2026. Anonymous registry
installation and CLI, Icons and SVG checks passed. `next` points to these versions; `latest`
still points to `rc.1`. No companion GitHub pre-release was created before the later CLI
version-source discrepancy was found.

| Package | Registry | SHA-256 |
| --- | --- | --- |
| Core | [`0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-core/v/0.1.0-rc.2) | `c79b9d5b592980500344057c310c43a67acda30787f5e19c96c5a831a344052e` |
| Icons | [`0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-icons/v/0.1.0-rc.2) | `d0d8d01eec13c97055bfdf9842ac8d331d5648f8bd55cf33ac1c5fe83a04da3d` |
| SVG | [`0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-svg/v/0.1.0-rc.2) | `bec106a2ef85bb8d4d17d896aeebb0145aef575b09d7f6c5d2f8919b17d1b7ff` |
| CLI | [`0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-cli/v/0.1.0-rc.2) | `403e6882abb1b10bbd0d06ac9d355731898d4d4102b9f156a7c1d198968b27e2` |

## Next candidate boundary

Only the CLI implementation has changed since the second candidate. A CLI-only
`0.1.0-rc.3` alongside the already published Core, Icons and SVG `0.1.0-rc.2` is the narrowest
candidate to review; it is not yet approved or published. Before accepting it, inspect the newly
packed CLI's dependency ranges, verify the exact mixed set from an anonymous clean consumer,
promote the reviewed correction through `develop` and `master` with green CI, and obtain a new
go/no-go for its immutable archive. A coordinated four-package candidate remains possible only
if the mixed set fails its compatibility or release-evidence review.

If unchanged published archives are reused, retain their original approved hashes and source
commit. Do not repack them under the new CLI revision. A companion GitHub pre-release must list
each package's exact version, source provenance and archive hash; its tag and assets require
separate approval. Do not label the mixed set as if every package were `rc.3`.

## Decision boundary

CI checks the source and packed-consumer contracts; a green check is necessary evidence, not
authorisation to publish. A maintainer explicitly reviews the exact commit, package contents,
artwork and software notices, release notes, npm scope permissions, and the final tarball hashes.
They then decide go or no-go. No push, merge, tag, version script, CI job, or Conventional Commit
title triggers a registry write. Garden's ecosystem record is maintained through a separate,
manually reviewed change only when the release materially affects it.

The intended pre-release channel is `next`. The registry also assigned `latest` to each first
package version even though publication explicitly supplied `--tag next`. It returned a
`400 Bad Request` when the maintainer attempted to remove Core's initial `latest` tag.
Consequently, `next` currently resolves to `0.1.0-rc.2` and `latest` to `0.1.0-rc.1`; consumers
should still select `@next` or the exact version to express pre-release intent. The future
stable `0.1.0` release will replace `latest` through a separate human decision.
See [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) and
[dist-tags](https://docs.npmjs.com/adding-dist-tags-to-packages/).

## Branch promotion

Complete the release-readiness work on its topic branch and merge it into `develop` only through
a reviewed pull request with green CI. After the candidate source and release evidence are
accepted, promote that exact reviewed revision to `master` and require green CI there as well.
Generate each newly published archive from a clean checkout of the approved `master` revision.
Already published compatible archives retain their original reviewed source commit and hash;
reusing them does not make them artefacts of the new commit.

Do not publish newly built archives produced before the final promotion, even when their contents
appear equivalent. Repacking changes the artefact under review and therefore requires new hashes
and a repeat of the dry-run inspection. Branch promotion, tagging and registry publication remain
separate human decisions; none follows automatically from a successful check.

## Prepare the candidate

The commands from here through [Verify the published result](#verify-the-published-result)
document the historical `rc.2` publication. Its versions and archive paths must not be reused
for another registry write. Prepare new version-specific commands only after the next candidate
set and its source provenance have been approved.

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
$releaseDir = "C:\absolute\path\to\aster-release-0.1.0-rc.2"
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

Inspect each resulting `luscious-garden-aster-{core,icons,svg,cli}-0.1.0-rc.2.tgz` rather than
assuming the workspace manifest is what npm will receive. Check the packaged `package.json`,
README, notices, exports, CLI binary, and dependency ranges. Core must have no production
dependency; Icons and SVG must
depend on Core `^0.1.0-rc.2`; CLI must depend on Core, Icons and SVG `^0.1.0-rc.2`. Every archive must
contain only its `dist/`, `package.json`, `README.md`, `LICENSE`, and, for Icons,
`ARTWORK-LICENCE.md`. There must be no `workspace:` range, private Import, tests, credentials,
tooling, or source tree. Record a SHA-256 digest for each final archive and do not repack between
approval and publication. Use the same tarballs for dry-run and live commands.

```powershell
Get-ChildItem -LiteralPath $releaseDir -Filter "*.tgz" | Get-FileHash -Algorithm SHA256
tar -tf "$releaseDir/luscious-garden-aster-core-0.1.0-rc.2.tgz"
tar -xOf "$releaseDir/luscious-garden-aster-core-0.1.0-rc.2.tgz" package/package.json
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
npm view @luscious-garden/aster-core@0.1.0-rc.2 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-icons@0.1.0-rc.2 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-svg@0.1.0-rc.2 version --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-cli@0.1.0-rc.2 version --registry=https://registry.npmjs.org/
```

The registry must be `https://registry.npmjs.org/` for these commands. Confirm through the npm
account or organisation controls that the publisher may publish under `@luscious-garden` and that
the four names are eligible. `whoami` proves authentication, not scope authority. A not-found
response from `npm view` does not grant ownership or prove that a name is available. An existing
`0.1.0-rc.2` is a stop condition, not a prompt to overwrite it. Do not put credentials in repository
files or CI variables for this manual procedure. Use interactive npm authentication and required
two-factor authentication; never paste an OTP or token into logs or a pull request. See npm's
[scoped public package guide](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
and [publishing authentication policy](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/).
If `whoami` reports no authenticated session, sign in interactively with
`npm login --registry=https://registry.npmjs.org/`, then repeat `whoami` and the scope permission
check before proceeding.

## Dry-run and publish

The live `rc.2` commands in this historical record have already succeeded. Do not run them
again or substitute a new archive without a separately approved version-specific procedure.

Run every dry-run against its approved archive. `--access public` is explicit for these scoped
packages; `--tag next` requests the intended pre-release channel. Inspect actual post-publication
tags because a package's first registry version may also acquire `latest`. A dry-run is not
publication.

```powershell
npm publish "$releaseDir/luscious-garden-aster-core-0.1.0-rc.2.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-icons-0.1.0-rc.2.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-svg-0.1.0-rc.2.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-cli-0.1.0-rc.2.tgz" --dry-run --access public --tag next --registry=https://registry.npmjs.org/
```

Stop for explicit human go/no-go after comparing the dry-run file lists, archive hashes, release
notes, rights, and registry access. If approved, publish the same tarballs in dependency order:

```powershell
npm publish "$releaseDir/luscious-garden-aster-core-0.1.0-rc.2.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-icons-0.1.0-rc.2.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-svg-0.1.0-rc.2.tgz" --access public --tag next --registry=https://registry.npmjs.org/
npm publish "$releaseDir/luscious-garden-aster-cli-0.1.0-rc.2.tgz" --access public --tag next --registry=https://registry.npmjs.org/
```

Stop on the first failure. Do not publish a dependent package before its required predecessors
are visible at the approved versions. Do not switch to `latest`, change a version, or rebuild an
archive to recover silently; re-assess the remaining release with a maintainer. There is no
automatic rollback of already published packages.

## Verify the published result

After registry propagation, inspect each published version, dependency map and dist-tags:

```sh
npm view @luscious-garden/aster-core@0.1.0-rc.2 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-icons@0.1.0-rc.2 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-svg@0.1.0-rc.2 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
npm view @luscious-garden/aster-cli@0.1.0-rc.2 version dependencies dist-tags --json --registry=https://registry.npmjs.org/
```

In a fresh external project without workspace links, install exact versions from npm, not the
local tarballs. After initialising that project, run:

```sh
pnpm add @luscious-garden/aster-core@0.1.0-rc.2 @luscious-garden/aster-icons@0.1.0-rc.2 @luscious-garden/aster-svg@0.1.0-rc.2
pnpm add -D @luscious-garden/aster-cli@0.1.0-rc.2
pnpm exec aster version
pnpm exec aster version core
pnpm exec aster version --all --json
pnpm exec aster list icons
```

Repeat the package README examples to verify a Core definition, isolated Icons import, and SVG
render under Node `>=24.10.0 <25`. Confirm typed collection aliases and ordered members, plus
the fixed `data-rendered-by="Aster"` root marker. Confirm the actual dist-tags and accessible
README/licence notices on the npm pages. Record the publication date, artefact hashes and registry
links in the package release notes before closing each future release.

## Promote a stable release

Do not present the release candidate as stable merely by moving an npm dist-tag. A stable
`0.1.0` release is a different Semantic Versioning identity and requires a reviewed source
change that removes the active candidate suffix from the five workspace package versions, updates public
dependency evidence to `^0.1.0`, and updates release notes and installation guidance. Repeat the
complete verification, clean tarball generation, hashes, registry checks and human go/no-go for
that exact stable commit. Publish the four new stable archives in dependency order under
`latest` only after the release candidate has been accepted. Import participates in the stable
source baseline but remains private and unpublished.
