import {
  DiagnosticResultFactory,
  IngestionSourceFactory,
  SourceDiagnosticAggregator,
  SourceDiagnosticFactory,
  SourceLocator,
} from "../../src/index.js";
import type {
  CanonicalSvgSource,
  CollectionMetadataSource,
  DiagnosticCodeType,
  DiagnosticResultType,
  IconMetadataSource,
  IngestionSourceType,
  SourceDiagnostic,
  SourceSpan,
} from "../../src/index.js";

const svgSource: CanonicalSvgSource = {
  kind: "svg",
  sourceId: "collections/minimal/svg/camera.svg",
  content: "<svg />\r\n",
  identity: {
    collection: "minimal",
    name: "camera",
  },
};

const collectionMetadata: CollectionMetadataSource = {
  kind: "collection-metadata",
  sourceId: "collections/minimal/metadata/collection.json",
  content: "{}\n",
  collection: "minimal",
};

const iconMetadata: IconMetadataSource = {
  kind: "icon-metadata",
  sourceId: "collections/minimal/metadata/camera.json",
  content: "{}\n",
  identity: {
    collection: "minimal",
    name: "camera",
  },
};

const span: SourceSpan = {
  start: { offset: 0, line: 1, column: 1 },
  end: { offset: 5, line: 1, column: 6 },
};

const code: DiagnosticCodeType = "ASTER-SYNTAX-001";
const diagnostic: SourceDiagnostic = {
  code,
  severity: "error",
  category: "syntax",
  message: "The SVG document is malformed.",
  sourceId: svgSource.sourceId,
  span,
  related: [
    {
      message: "The document starts here.",
      sourceId: svgSource.sourceId,
      span,
    },
  ],
};

const sources: readonly IngestionSourceType[] = [
  svgSource,
  collectionMetadata,
  iconMetadata,
];
const successful: DiagnosticResultType<CanonicalSvgSource> = {
  successful: true,
  value: svgSource,
  diagnostics: [],
};
const failed: DiagnosticResultType<CanonicalSvgSource> = {
  successful: false,
  diagnostics: [diagnostic],
};

function consumeResult(
  result: DiagnosticResultType<CanonicalSvgSource>,
): void {
  if (result.successful) {
    void result.value;
  } else {
    // @ts-expect-error Failed results intentionally carry no partial output.
    void result.value;
  }
}

consumeResult(successful);
consumeResult(failed);

// @ts-expect-error Diagnostic codes use an Aster-owned category family.
const externalCode: DiagnosticCodeType = "XML-PARSER-001";

void sources;
void successful;
void externalCode;
void new IngestionSourceFactory();
void new SourceLocator();
void new SourceDiagnosticFactory();
void new SourceDiagnosticAggregator();
void new DiagnosticResultFactory();
