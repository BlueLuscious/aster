# Import Shared

Shared contains only private primitive object validation, strict canonical slug validation and
unambiguous portable identity formatting used by more than one format-neutral Import feature. SVG
vocabularies, number grammars and path inspection remain under the
[SVG adapter](../formats/svg/shared/index.md).

Shared exports no public package authority and must not become a convenience location for
format-specific or host-specific code.

Primitive validation accepts null-prototype or ordinary plain records and ordinary dense arrays.
It rejects symbols, hidden fields, accessors, inherited behaviour, sparse elements and authored
array side state before reading retained values. Closed request records also enforce every required
field before domain processing. Unrelated Proxy execution failures preserve their original
identity rather than becoming misleading Import diagnostics.

`CanonicalSlugValidator` checks Import's exact lowercase kebab-case grammar without changing the
input. Core and Import use the same identity domain but different boundary policies: Core may
normalise authoring input; Import rejects non-canonical claims with its own error paths. The
identity formatter preserves namespace absence without consulting inherited properties.
