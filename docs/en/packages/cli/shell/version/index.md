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

`TInstalledPackageSelector` is the internal type derived from the ordered package descriptors;
it restricts a named read to one of the four accepted selectors. `IInstalledPackageVersion` is
the internal contract for each validated `{ name, version }` record returned by the reader.
Neither contract is part of the public command API.

Node's package-metadata resolver locates package roots without requiring their entrypoints or
`package.json` subpaths to be publicly exported. A separate file read acquires each manifest.
The caller supplies the CLI entrypoint URL, so local, global and isolated installations use the
dependency tree associated with that executable rather than a package elsewhere in the current
directory. The standalone shell's current public grammar still offers only the CLI-version
request (`aster version`, optionally with `--json`); the reader is not yet invoked by it.

The [shell feature](../index.md) owns the executable composition and presentation boundary.
