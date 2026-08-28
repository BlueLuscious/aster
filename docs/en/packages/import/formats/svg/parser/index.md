# Import SVG Parser

The parser converts exact untrusted SVG text into parser-neutral located syntax. Its internal
contracts describe elements, attributes and documents without leaking dependency tokens. It owns
malformed XML, inert-section, namespace, capability and fixed safety-limit diagnostics.

A successful parse is still untrusted and must enter technical validation. Arbitrary processing
instructions, doctypes, entities and unsupported content remain rejected even when XML parsing
succeeds.

## Internal contracts

- `ISvgParser` is the parser adapter consumed by the built-in SVG import boundary.
- `ISvgSyntaxDocument` owns the accepted single-root parser-neutral document.
- `ISvgSyntaxElement` owns one located namespace-resolved element and its ordered children.
- `ISvgSyntaxAttribute` owns one located namespace-resolved authored attribute.

## Internal types

- `TSvgAttributeInput` and `TSvgElementInput` are mutable dependency-token inputs isolated during
  syntax-tree construction.
- `TSvgAttributeLocation` and `TSvgTagLocation` retain exact source boundaries recovered from the
  canonical text.
- `TSvgSyntaxElementBuilder` is the private mutable assembly shape frozen into
  `ISvgSyntaxElement`.
- `TSvgParsingIssue` is the parser-neutral discriminated evidence translated into Aster-owned
  diagnostics.
