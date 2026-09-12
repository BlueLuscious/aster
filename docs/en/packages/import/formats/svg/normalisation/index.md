# Import SVG Normalisation

Normalisation converts validated supported elements into Core node and presentation values in
paint order. It owns source-coordinate resolution, path-command expansion, finite number
conversion and inherited presentation resolution.

`SvgPathDataNormaliser` translates absolute and relative SVG commands into absolute Core
commands. Repeated parameter groups become individual operations, horizontal and vertical lines
become ordinary lines, smooth-curve controls are reflected explicitly, arc flags become booleans,
and every authored contour is retained in order. The resulting path node contains immutable
structured commands and no raw SVG `d` value.

Validation and normalisation share the same immutable SVG schemas, finite-number parser and path
inspector. Normalisation deliberately rechecks accepted lexical values at the trust hand-off
rather than retaining mutable parser caches or partially normalised nodes from a failed validation
pass. Any future attempt to remove that bounded defensive work requires measured evidence and an
immutable intermediate model.

The SVG parser, source command letters and shorthand rules remain private to Import. Core does not
learn SVG grammar, while the normaliser consumes Core's public command discriminators rather than
copying the portable vocabulary.

It does not construct complete definitions, infer metadata or apply collection policy. The
format-neutral Adoption feature combines its output with host-reviewed metadata through Core.
