# Import SVG Normalisation

Normalisation converts validated supported elements into Core node and presentation values in
paint order. It owns path whitespace canonicalisation, finite number conversion and inherited
presentation resolution.

Validation and normalisation share the same immutable SVG schemas, finite-number parser and path
inspector. Normalisation deliberately rechecks accepted lexical values at the trust hand-off
rather than retaining mutable parser caches or partially normalised nodes from a failed validation
pass. Any future attempt to remove that bounded defensive work requires measured evidence and an
immutable intermediate model.

It does not construct complete definitions, infer metadata or apply collection policy. The
format-neutral Adoption feature combines its output with host-reviewed metadata through Core.
