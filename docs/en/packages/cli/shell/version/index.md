# CLI Shell Version Metadata

Status: **Pre-release**

The private `CliPackageVersionReader` resolves public Aster package manifests relative to an
explicit CLI entrypoint file URL. The separate `ProjectPackageVersionReader` starts at the
invocation directory, selects the nearest project `package.json`, and reads only packages
declared directly by that project. Neither reader queries npm or GitHub or imports catalogue
and icon-definition modules. Both are host-only and outside the public
`@luscious-garden/aster-cli` API.

The project reader recognises exact public package names in `dependencies`, `devDependencies`
and `optionalDependencies`; peer-only and transitive installations do not count. It reports
versions from installed manifests rather than declared ranges. An absent optional package is
omitted from an aggregate read, while absent required packages and named requests fail. It
accepts a UTF-8 BOM in otherwise valid JSON. The CLI reader uses the same manifest validation
but remains bound to its own dependency tree.

The supported selectors are `core`, `icons`, `svg` and `cli`. One selector reads only its own
manifest. `all` reads the CLI's complete package family or the project's directly declared
subset, in Core, Icons, SVG and CLI order. Each installed manifest must declare its expected
package name and a non-empty, unpadded string version. Both readers return frozen
`{ name, version }` records and a frozen array. They reject missing or malformed required
metadata instead of returning an incomplete result. They do not validate installed dependency
ranges or attempt to repair an installation.

The public closed `AsterInstalledPackageSelectorType` restricts a named read to one of the four
accepted selectors. Both readers return the public host-evidence contract
`AsterInstalledPackageVersion`. Their ordered private descriptors are derived from the same
package name authority used by the host-neutral command. The readers remain private.

Node's package-metadata resolver locates package roots without requiring their entrypoints or
`package.json` subpaths to be publicly exported. A separate file read acquires each manifest.
The CLI reader receives the entrypoint URL, so local, global and isolated installations use the
dependency tree associated with that executable rather than a package elsewhere in the current
directory. The shell invokes the CLI reader only for `aster version <core|icons|svg|cli>` or
`aster version --all`, with optional `--json`. Plain `aster version` and its JSON form use the
entrypoint's own version and do not read the other package manifests. Acquisition failure after
startup produces one sanitised shell failure, not a partial version list.
If Core or SVG prevents the executable from starting, Node reports its native dependency error
before a reader or the shell failure path can run. The version field is checked for a
non-empty string without surrounding whitespace, not for SemVer compatibility with the other
installed packages.

The [shell feature](../index.md) owns the executable composition and presentation boundary.
