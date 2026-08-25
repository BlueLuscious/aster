# 0005: Public SVG Renderer Boundary

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-07-30**

Affected documents:

- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)
- [Rendering Contract](../architecture/rendering-contract.md)
- [SVG Renderer](../packages/svg/index.md)

Supersedes: **None**

Superseded by: **None**

## Context

Portable Core definitions need one complete consumer-facing rendering path and TypeScript-to-SVG
evidence. Rendering is target behaviour and cannot enter Core without coupling the portable model
to SVG syntax. The public API also needs to avoid colliding semantically with Core's existing
`Icon.define()` authority.

## Decision drivers

- Preserve a dependency-free and target-independent Core.
- Consume only public portable definitions and options.
- Produce output usable by server rendering, static generation, tests, streams, and file hosts.
- Avoid DOM, browser, Node, framework, Build, and collection-catalogue authority.
- Keep the initial API object-based, explicit, deterministic, and stateless.
- Avoid generated wrappers and target extensions before concrete consumers justify them.

## Options

### Add SVG rendering to Core

This would provide one `Icon` object but would make SVG syntax, escaping, accessibility mapping,
and target failures part of the portable foundation.

### Export another `Icon` object from an SVG package

This would keep the target separate, but consumers composing Core and SVG would need aliases for
two different objects named `Icon`.

### Export `Svg` from a dedicated package

This keeps target authority explicit: Core owns `Icon.define()`, while SVG owns
`Svg.render(definition, options)`.

## Decision

Create public `@aster/svg`, dependent only on the public root of `@aster/core`.

The package exposes one frozen `Svg` API object implementing `SvgApi`. Its `render()` operation
accepts one explicit `IconDefinition`, accepts optional Core `IconRenderOptions`, and returns
`SvgMarkupType`, a plain string containing one complete standalone `<svg>` value.

The concrete renderer and option-error implementation remain internal classes. The package
exposes only its root export and introduces no DOM insertion, target-extension object, generated
named wrapper, collection registry, filesystem operation, or framework integration.

## Consequences

### Positive

- Core remains target independent.
- Call sites distinguish definition construction from target rendering without import aliases.
- One output works across host environments without granting trusted-markup authority.
- Renderer versioning, errors, and SVG conformance have an independent public boundary.
- TypeScript-first definitions can produce SVG without the optional Build importer.

### Negative

- Consumers install a second package when they need generic SVG output.
- A plain string still requires a host-controlled parsing or insertion boundary in a browser.
- Future named wrappers or target extensions require separate compatibility decisions.

### Deferred

- Decide whether authoring-oriented SVG export requires a narrower result profile.
- Evaluate generated wrappers only after `@aster/icons` or a framework adapter demonstrates demand.

## Compatibility and migration

This is the first SVG renderer package and affects no released consumer. Hardened pre-release
conformance now fixes its root exports, declarations, error observables, option behaviour, and
deterministic markup as the basis for a future compatibility-bearing release.

## Evidence

- [SVG API](../packages/svg/api/index.md)
- [SVG Render Error](../packages/svg/error/index.md)
- [SVG Render Result](../packages/svg/render/index.md)
- [Accessibility and Direction](../architecture/accessibility-and-direction.md)
