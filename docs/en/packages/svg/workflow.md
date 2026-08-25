# SVG Workflow

Status: **Accepted**

This document explains how one supplied portable definition and optional render value
become complete standalone SVG markup. Feature documents remain authoritative for individual
contracts, options, output rules, and errors. Open correctness boundaries are recorded in
[SVG Quality](quality.md).

## Public entry

Rendering begins through the immutable package object:

```ts
const markup = Svg.render(definition, options);
```

The API owns one stateless `SvgRenderer` instance. Sharing that object introduces no render state:
definitions, options, accepted context, intermediate strings, and results remain local to each
synchronous call.

## Definition acceptance

`SvgRenderer` first passes the supplied definition to the public Core `Icon.define()` authority.
The static TypeScript shape is not trusted. Core validates and reconstructs the complete portable
graph, canonicalises accepted values, isolates caller-owned data, and returns one deeply frozen
definition.

```text
supplied definition
    |
    v
Icon.define()
    |
    +--> exact portable validation
    +--> canonical reconstruction
    +--> deep immutability
    |
    v
isolated IconDefinition
```

The renderer converts only public Core `IconDefinitionError` instances into `SvgRenderError`. It
preserves the logical Core path, replaces the reason with deterministic SVG-owned language, and
does not expose the Core message. Caller-controlled reflective or execution failures propagate
unchanged because SVG cannot classify them as target programming errors.

## Option normalisation

`SvgRenderOptionsNormaliser` accepts the optional value and resolves one frozen internal render
context. It:

- accepts only plain records with own enumerable string-named data fields;
- rejects symbols, hidden fields, accessors, inherited state, and unknown fields before reading
  option values;
- captures accepted values in a frozen local snapshot so later processing never reads or retains
  the caller-owned record;
- canonicalises size, colour, fill, stroke, stroke width, text, boolean, and direction values;
- enforces icon minimum size and authorised presentation overrides;
- derives decorative or semantic accessibility state;
- resolves the effective accessible name and optional title;
- resolves width and height from explicit size, icon default size, or the view box;
- retains only the reconstructed definition and accepted option effects.

The context has no public export and carries no DOM, filesystem, process, catalogue, or lifecycle
authority. Failures raised by caller-controlled reflection itself preserve their original identity.

## Serialisation

`SvgMarkupSerialiser` consumes only the accepted context. It builds the root attributes in fixed
order, resolves complete presentation for each node, maps portable nodes to SVG geometry, escapes
target text, and joins all content into one compact string.

`SvgXmlCharacterValidator` first applies the exact XML 1.0 code-point repertoire to option text and
every source value that enters markup. It accepts valid supplementary pairs, rejects isolated
surrogates and excluded code points, and reports the logical option or definition path without
silently replacing content.

```text
accepted render context
    |
    +--> root namespace, viewBox, viewport, colour, and accessibility
    +--> optional escaped title
    +--> geometry in portable paint order
    +--> technical, icon, node, and authorised caller presentation
    +--> optional single RTL mirror group
    |
    v
complete SvgMarkupType
```

The serialiser does not append to a caller-visible stream or mutate a target. A successful call
returns one complete `<svg>...</svg>` value; a synchronous failure returns no partial output.
Core portability and XML serialisability remain separate responsibilities: Core owns the portable
definition, while SVG owns whether its strings can enter this target and how each output context is
escaped.

## Consumer hand-off

The result is a plain string. Repository authoring workflows use it as deterministic review or
derived distribution evidence. A consumer may write, transmit, parse, or insert it only under its
own target and security policy; `SvgMarkupType` does not grant trusted-markup or DOM-insertion
authority.

Repeated rendering, collection export, file output, terminal presentation, and future adapter
composition belong to explicit consumers or hosts around `Svg.render()`. They do not enlarge this
package's state or authority.

## Related documentation

- [SVG API](api/index.md) defines the public operation and failure surface.
- [SVG Render Result](render/index.md) defines canonical output ordering and representation.
- [SVG Render Runtime](render/runtime/index.md) documents the internal composition.
- [SVG Quality](quality.md) records accepted decisions, conformance, and bounded change pressures.
- [Core Workflow](../core/workflow.md) defines the portable construction authority used first.
