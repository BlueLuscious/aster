# Import SVG Parser

The parser converts exact untrusted SVG text into parser-neutral located syntax. Its internal
contracts describe elements, attributes and documents without leaking dependency tokens. It owns
malformed XML, inert-section, namespace, capability and fixed safety-limit diagnostics.

A successful parse is still untrusted and must enter technical validation. Arbitrary processing
instructions, doctypes, entities and unsupported content remain rejected even when XML parsing
succeeds.

## Trust boundary

`xmlsax-typescript@1.0.0` is the selected private XML implementation. Its tokens, error objects and
messages do not cross the parser boundary. Aster immediately converts successful tokens into its
own located syntax inputs, translates recognised XML failures into stable diagnostics and
sanitises unrecognised dependency failures as Aster-owned internal errors.

The accepted XML surface is deliberately narrower than general XML. It permits only the exact
lower-case `xml` declaration with version `1.0`, optional UTF-8 encoding and optional `yes` or `no`
standalone state. Doctypes, entity references, CDATA, arbitrary processing instructions,
executable or embedded elements, external resources and foreign namespaces are rejected.
Comments remain inert and cannot make apparent markup executable.

## Parser limits

Limits count JavaScript UTF-16 code units and parser-observed XML structure. A value at its limit is
accepted by this boundary; the immediately greater value produces `ASTER-SAFETY-009` and no syntax
document.

| Resource | Maximum |
| --- | ---: |
| Exact decoded source | 1,048,576 code units |
| Element depth | 64 elements |
| Elements | 10,000 elements |
| Attributes on one element | 128 attributes |
| One raw text section | 262,144 code units |
| One authored `d` attribute value | 262,144 code units |

These are safety ceilings rather than recommended authoring sizes or performance promises. Import
does not truncate oversized values, recover a partial tree or continue adoption after any parser
failure.

## Source evidence

The XML dependency establishes well-formed token boundaries. `SvgTagLocator` then scans only those
parser-proven tags to recover exact authored names, values and spans, while
`SvgSyntaxTreeBuilder` alone owns hierarchy assembly. `SourceLocator` indexes line starts once per
canonical source and resolves positions without normalising caller content. Offsets and columns
use UTF-16 code units; LF and CRLF each count as one line break.

Parser diagnostics carry one exact primary span when the violation has one source locus. They do
not fabricate related context; the optional `related` field remains available to later diagnostic
families that genuinely relate independent locations.

An Aster-owned XML tokeniser is not currently justified. The dependency is pinned, contained and
covered by conformance evidence. Replacement remains conditional on measured security,
maintenance, grammar-control, source-precision or performance evidence.

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
