# CLI Shell Version Metadata

Status: **Pre-release**

The shell reads local installed manifests without importing package entrypoints or contacting a
registry. This host-only feature is not part of the public programmatic CLI API. The
[shell guide](../index.md) defines the user-facing grammar and output.

`ProjectPackageVersionReader` starts at the invocation directory and selects the nearest project
`package.json`. Its direct package set comes from `dependencies`, `devDependencies` and
`optionalDependencies`; peer-only, hoisted-but-undeclared and transitive packages are excluded.
An absent optional installation is omitted from `--all`, while a missing required installation
or named package fails. Named Core, Icons and SVG queries use this source. `--all` uses it even
when the running CLI is installed elsewhere; a project CLI appears only when directly installed.

`CliPackageVersionReader` uses the loaded CLI entrypoint URL, never the project directory. It is
only needed for `--deps` on the executed CLI. Plain `version` and `version cli` use the
entrypoint's supplied product version without reading package manifests. The shared
`InstalledPackageDependencyReader` reads the selected root's own manifest, validates its exact
identity and version, and resolves only declared direct Aster `dependencies` relative to that
installation. Development, peer, optional, unrelated and transitive dependencies do not enter
these groups. Each project root in `--all --deps` is resolved independently; the same dependency
may therefore have different installed versions in different groups. A missing or malformed
required dependency invalidates the complete request without partial output.

`CliLocationReader` runs only for `--location`. It reports the loaded CLI module path and compares
canonical package-manifest paths with the project's directly installed CLI, when available.
Comparison outcomes are `same`, `different`, `absent`, `no-project` and `unavailable`. A different
path does not prove a global installation; no command-selection behaviour changes. The comparison
uses canonical paths so package-manager links and Windows path spelling do not turn one
installation into a false mismatch. The [shell guide](../index.md) owns the user-facing command
examples and output shapes.

The manifest reader accepts UTF-8 BOM JSON and requires exact known package names and non-empty,
unpadded string versions. It validates the root's known direct Aster dependency declarations and
rejects a self-dependency. Package metadata resolution does not require exported `package.json`
subpaths. Expected failures become sanitised `ASTER-CLI-011` diagnostics without native paths.
If a dependency prevents the executable from starting, Node reports its own error before this
feature runs. No SemVer-compatibility check or release-history lookup is performed.
