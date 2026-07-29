# Build Shared Authorities

Status: **Accepted**

The shared feature owns immutable SVG vocabularies and primitive build-service assertions consumed
by more than one internal Build feature. It contains no parser-library values, filesystem
behaviour, portable construction API, or mutable global state.

## Canonical vocabularies

| Authority | Responsibility | Consumers |
| --- | --- | --- |
| `svgSourceElementNames` | Defines every recognised SVG source element name. | Parser, validation, and normalisation. |
| `svgSourceElementRoles` | Classifies recognised elements as root, structural, or primitive syntax. | Parser, validation, and normalisation. |
| `svgSourceAttributeNames` | Defines accepted and explicitly rejected namespace-free SVG attribute names. | Parser, validation, and normalisation. |
| `svgSourceElementSchema` | Associates every recognised element with its role and accepted non-presentation attributes. | Parser, validation, and normalisation. |
| `svgPresentationAttributeSchema` | Maps accepted SVG presentation attributes to portable fields, value families, inheritance, numeric domains, and stroke evidence. | Validation and normalisation. |
| `svgPresentationValueKinds` | Discriminates paint, enumeration, and number schema entries. | Validation and normalisation. |
| `svgNumericDomains` | Defines finite, positive, non-negative, and opacity number domains. | Validation schemas and geometry readers. |
| `svgPaintSchema` | Defines the accepted source paint keywords and hexadecimal colour grammar. | Validation and normalisation. |

These authorities describe the Build source boundary. Equal portable values remain owned by
[`@aster/core`](../../core/index.md); textual equality alone does not grant Build authority over
the portable model or make private Core implementation paths reusable.

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TSvgSourceElementName` | Derives the closed recognised source-element union from `svgSourceElementNames`. | Exhaustive key of `svgSourceElementSchema`. |
| `TSvgSourceElementRole` | Derives the structural role union from `svgSourceElementRoles`. | Role carried by each source-element schema entry. |
| `TSvgNumericDomain` | Derives every internal numeric domain from `svgNumericDomains`. | Foundation for narrower geometry and presentation domains. |
| `TSvgPresentationNumericDomain` | Excludes the unconstrained finite domain from presentation schema entries. | Used by `svgPresentationAttributeSchema` and presentation validation. |

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `BuildValueValidator` | Provides plain-object, exact-field, text, number, integer, and array assertions for private Build services. | Raises `BuildContractError` for invalid service values. |
| `BuildContractError` | Represents deterministic invalid build-service input with code `ASTER-BUILD-001` and a logical value path. | Internal programming error, never a source diagnostic. |

Shared authorities remain stateless and immutable. A value belongs here only when multiple Build
features depend on the same semantics; feature-specific limits, safety policies, issue families,
and algorithms remain with their owning feature.
