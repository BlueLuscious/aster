# Build SVG Parser

Status: **Accepted**

The parser feature converts exact acquired SVG text into a deeply immutable, parser-neutral
syntax model. Its successful output is still untrusted and remains internal to `@aster/build`;
later validators must establish schema and semantic authority before Core data can be created.

## Boundary

`SvgParser` is a concrete internal class implementing `ISvgParser`. It confines
`xmlsax-typescript` tokens to one adapter and returns `DiagnosticResultType<ISvgSyntaxDocument>`.
Neither the class, its service contract, nor syntax contracts are exported from the package root.

The XML dependency provides token-level parsing and namespace metadata. Aster separately proves
accepted XML characters, comment structure, unique qualified attributes, single-root document
shape, accepted source policy, exact spans, fixed resource limits, and the absence of blocking
diagnostics before returning syntax.

## Internal contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `ISvgParser` | Converts one `CanonicalSvgSource` into complete syntax or failure without partial output. | Implemented by `SvgParser`; returns `DiagnosticResultType<ISvgSyntaxDocument>`. |
| `ISvgSyntaxDocument` | Retains the canonical logical source and sole syntax root. | Successful internal output of `ISvgParser`. |
| `ISvgSyntaxElement` | Retains qualified and local names, namespace, attributes, children, and exact opening and complete spans. | Recursively composed in exact source and paint order. |
| `ISvgSyntaxAttribute` | Retains qualified and local names, namespace, exact authored value, and exact name, value, and complete spans. | Ordered by its owning `ISvgSyntaxElement`. |

Internal interfaces use the `I` prefix because they are implementation boundaries rather than the
private package root workspace surface.

## Internal types

| Type | Responsibility | Relations |
| --- | --- | --- |
| `TSvgAttributeInput` | Carries one located parser-neutral attribute before syntax construction. | Converted immediately from parser-library namespace metadata and Aster-owned locations. |
| `TSvgAttributeLocation` | Carries exact authored qualified-name, value, and complete attribute spans. | Produced by `SvgTagLocator`; combined with parser metadata by `SvgParser`. |
| `TSvgElementInput` | Carries one located parser-neutral opening element before syntax construction. | Submitted to `SvgSyntaxTreeBuilder`. |
| `TSvgParsingIssue` | Represents parser-neutral evidence for one stable diagnostic family. | Produced by parser policies and mapped by `SvgParsingDiagnosticFactory`. |
| `TSvgSyntaxElementBuilder` | Retains mutable construction-only element state. | Deeply isolated into `ISvgSyntaxElement` by `SvgSyntaxTreeBuilder`. |
| `TSvgTagLocation` | Groups an opening-tag span, qualified-name span, ordered attribute locations, and optional duplicate name. | Output of `SvgTagLocator`. |

## Feature-owned authorities

| Authority | Responsibility |
| --- | --- |
| `svgParsingIssueKinds` | Defines every parser-neutral issue discriminator. |
| `svgNamespaces` | Defines the SVG element and XML namespace declaration authorities. |
| `svgParserLimits` | Defines fixed source length, depth, element, and attribute safety limits. |
| `svgSafetyAttributePolicy` | Defines rejected event-handler and resource-bearing attribute grammar. |
| `svgSafetyElements` | Classifies rejected executable and embedded SVG elements. |
| `xmlInertSections` | Defines comment, CDATA, and processing-instruction lexical boundaries. |

These immutable values remain separate because they represent different parser responsibilities.
Token discriminators from `xmlsax-typescript` remain part of the private external adapter ABI and
are not copied into Aster-owned issue vocabularies.

## Runtime responsibilities

| Class | Responsibility |
| --- | --- |
| `SvgParser` | Contains parser-library tokens, enforces document shape and parser limits, composes policies, and emits all-or-nothing results. |
| `SvgTagLocator` | Recovers exact opening-tag, closing-tag, element-name, attribute-name, and attribute-value spans from parser-validated canonical text. |
| `SvgSyntaxTreeBuilder` | Preserves hierarchy and source order before deeply freezing the complete syntax document. |
| `SvgSafetyValidator` | Identifies executable, raster, embedded, resource-bearing, event-handler, and foreign-namespace syntax. |
| `SvgSubsetValidator` | Applies accepted parser-stage behaviour for roots, geometry elements, groups, transforms, text, and CDATA. |
| `SvgParsingDiagnosticFactory` | Maps parser-neutral issues to stable Aster codes, messages, categories, and spans. |
| `SvgEntityReferenceDetector` | Finds expansion markers outside inert comments, CDATA, and processing instructions. |
| `SvgXmlCharacterValidator` | Rejects code points outside the accepted XML 1.0 character set before syntax can succeed. |

The builder is completed only when no blocking issue exists. Parser errors, recovered or
partially assembled values, multiple roots, and missing roots therefore never produce a result
value.

## Accepted syntax behaviour

| Source syntax | Behaviour |
| --- | --- |
| Sole `svg` root in the SVG namespace | Retained with exact attributes and spans. |
| `g` | Retained structurally for later inheritance validation and normalisation. |
| `path`, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon` | Retained in exact source and paint order. |
| Comments | Ignored as inert source syntax. |
| XML whitespace | Ignored, including whitespace around the sole root. |
| Definitions and unknown elements | Rejected as unsupported technical syntax. |
| `transform` attributes | Rejected as unsupported technical syntax. |
| Non-whitespace character data | Rejected as unsupported geometry syntax inside the root and malformed document content outside it. |
| CDATA | Rejected as unsupported technical syntax. |

Attribute schema, `viewBox`, geometry numbers, path data, points, presentation values, inherited
group presentation, and unknown ordinary attributes remain untrusted inputs for later technical
validation. Parsing does not silently accept them as portable data.

## Safety policy

Safety failures are always blocking:

- document type declarations and entity references are rejected;
- scripts, animation, interactive content, raster content, embedded documents, and resolved
  elements are rejected;
- attributes beginning with `on`, `href` or `src`, and values containing `url(...)` are rejected;
- foreign element and attribute namespaces are rejected;
- processing instructions are rejected;
- content inside an already rejected unsafe subtree is not interpreted for additional technical
  claims.

The standard default `xmlns="http://www.w3.org/2000/svg"` declaration is retained. Other namespace
declarations are rejected because the accepted subset has no safe consumer for them.

## Resource limits

The initial trust boundary accepts at most:

| Limit | Value |
| --- | ---: |
| Canonical source length | 1,048,576 UTF-16 code units |
| Element count | 10,000 |
| Structural depth | 64 elements including the root |
| Attributes per element | 128 |

Exceeding a limit returns `ASTER-SAFETY-009` and no syntax value. These are safety limits, not
collection-quality rules or promises that accepted artwork is inexpensive to render.

## Diagnostics

| Code | Meaning |
| --- | --- |
| `ASTER-SYNTAX-001` | The input is not one well-formed single-root XML document. |
| `ASTER-SAFETY-001` | A document type declaration is present. |
| `ASTER-SAFETY-002` | An entity reference is present. |
| `ASTER-SAFETY-003` | An executable or interactive SVG element is present. |
| `ASTER-SAFETY-004` | Raster, embedded, or resolved element content is present. |
| `ASTER-SAFETY-005` | An event-handler attribute is present. |
| `ASTER-SAFETY-006` | A resource-bearing attribute or value is present. |
| `ASTER-SAFETY-007` | Foreign namespace content or declaration is present. |
| `ASTER-SAFETY-008` | A processing instruction is present. |
| `ASTER-SAFETY-009` | An accepted parser safety limit is exceeded. |
| `ASTER-TECHNICAL-001` | An element is outside the accepted source subset. |
| `ASTER-TECHNICAL-002` | A transform is present. |
| `ASTER-TECHNICAL-003` | Character data is present in geometry content. |
| `ASTER-TECHNICAL-004` | A CDATA section is present. |

External parser messages and codes never enter these reports. Diagnostic spans use canonical
zero-based UTF-16 offsets, one-based logical lines and columns, and exclusive end positions from
the [Build Diagnostic](../diagnostic/index.md) contract.

The dependency and replacement boundary is recorded by
[Private XML Parser Boundary](../../../decisions/0003-private-xml-parser-boundary.md).
