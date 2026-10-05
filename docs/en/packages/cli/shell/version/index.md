# CLI Shell Version Metadata

Status: **Pre-release**

The private `InstalledPackageVersionReader` resolves the four public Aster package manifests
relative to an explicit CLI entrypoint file URL. It does not inspect the caller's working
directory, query npm or GitHub, or import catalogue and icon-definition modules. This host-only
reader does not belong to the public `@luscious-garden/aster-cli` API.

The supported selectors are `core`, `icons`, `svg` and `cli`. One selector reads only its own
manifest; `all` reads Core, Icons, SVG and CLI in that order. Each manifest must declare its
expected package name and a non-empty, unpadded string version. The reader returns frozen
`{ name, version }` records and a frozen array. It rejects missing or malformed required
metadata instead of returning an incomplete result. It does not validate installed dependency
ranges or attempt to repair an installation.

The public closed `AsterInstalledPackageSelectorType` restricts a named read to one of the four
accepted selectors. The reader returns the public host-evidence contract
`AsterInstalledPackageVersion`. Its ordered private descriptors are derived from the same package
name authority used by the host-neutral command. The reader itself remains private.

Node's package-metadata resolver locates package roots without requiring their entrypoints or
`package.json` subpaths to be publicly exported. A separate file read acquires each manifest.
The caller supplies the CLI entrypoint URL, so local, global and isolated installations use the
dependency tree associated with that executable rather than a package elsewhere in the current
directory. The shell invokes the reader only for `aster version <core|icons|svg|cli>` or
`aster version --all`, with optional `--json`. Plain `aster version` and its JSON form use the
entrypoint's own version and do not read the other package manifests. Acquisition failure after
startup produces one sanitised shell failure, not a partial version list.

The [shell feature](../index.md) owns the executable composition and presentation boundary.
