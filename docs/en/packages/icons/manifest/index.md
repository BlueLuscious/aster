# Icons Distribution Manifest

Status: **Accepted**

`@aster/icons/manifest` exposes immutable metadata for discovery without importing icon geometry,
presentation policy or complete collection definitions. It is the lightweight package surface for
search, listing and later on-demand resolution; it is not a mutable registry and does not load a
definition by itself.

## Public values

```ts
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "@aster/icons/manifest";
```

`AsterIconManifest` is ordered by canonical icon key. Each `IconManifestEntry` retains:

- `key`, using `[<namespace>/]<name>[@<variant>]`;
- the complete portable `identity`;
- the named public export in `symbol`;
- `displayName`, optional `tags` and the `rtl` policy;
- optional effective `licence` and `attribution`;
- `deprecated` and an optional complete `replacedBy` identity.

`AsterCollectionManifest` is ordered by canonical collection key. Each
`CollectionManifestEntry` retains:

- `key`, using `[<namespace>/]<name>`;
- the complete portable `identity`;
- the named public export in `symbol`;
- complete descriptive `metadata`;
- ordered canonical icon keys in `members`.

The manifest deliberately contains no `viewBox`, render nodes, presentation policy, icon object or
embedded collection member definition. A collection member is a textual icon key, so inspecting a
collection record does not evaluate that icon.

## Generation

Catalogue source tooling derives the manifest from accepted canonical `*.icon.ts` and
`*.collection.ts` modules. It parses a finite data-only TypeScript subset and resolves local or
relative imported constants without executing source modules. Imported authorities must use
unambiguous runtime named imports and target exported top-level constants. Literals, arrays, object
literals, property access, syntax-only TypeScript wrappers and one-argument `Object.freeze(...)`
calls are accepted. Calls requiring execution, type-only or ambiguous bindings, duplicate or
computed properties, unresolved values and cyclic references are rejected before generated outputs
are changed.

Identity names and variants remain path-owned. Collection membership remains explicitly authored
and its order is preserved. Removing a source removes its record during the same deterministic
synchronisation; removing a referenced icon is rejected as a dangling relationship instead of
silently altering a collection.

The generated values, records, nested identities, metadata, tag arrays, replacement identities and
member arrays are all frozen. The generated module has type-only contract imports, so its emitted
JavaScript imports no canonical definition module. The public manifest entrypoint re-exports only
that data module.

## Contracts

`IconManifestEntry` describes one lightweight searchable icon record and relates discovery data to
public Core identity and RTL contracts. `CollectionManifestEntry` describes one collection record,
reuses public Core identity and metadata contracts, and replaces embedded definitions with ordered
member keys. Both interfaces are public only through `@aster/icons/manifest`.

The manifest does not promise selective package installation. Installing `@aster/icons` still
installs every published file; the manifest only prevents unrelated runtime evaluation and makes a
future remote registry or `aster add` workflow possible without changing canonical definitions.

## Verification

Runtime evidence compares every manifest record with definitions resolved through exact loaders,
checks canonical ordering and recursively verifies immutability. Catalogue tooling tests cover
deterministic creation, drift, additions, removals, static imported authorities, rejected executable
syntax, cycles and stale-record cleanup. ABI and clean-consumer tests verify the exact
`@aster/icons/manifest` subpath, declarations and emitted dependency graph.

Fresh-process evaluation is measured by the [Icons Quality Baseline](../quality-baseline.md).
Canonical authoring and regeneration are defined by the [Icons Authoring Workflow](../workflow.md)
and [Catalogue Source Tooling](../../../tooling/catalogue/index.md).
