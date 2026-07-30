import assert from "node:assert/strict";
import test from "node:test";

import {
  CollectionBuildPipeline,
  IngestionSourceFactory,
  type CollectionBuildEntry,
  type CollectionBuildRequest,
  type CollectionMetadataSource,
} from "@aster/build";
import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import { Svg } from "@aster/svg";

const pipeline = new CollectionBuildPipeline();
const sourceFactory = new IngestionSourceFactory();

function authorArrowLeft(shaftStartX = 4): IconDefinition {
  return Icon.define({
    identity: {
      collection: "aster",
      name: "arrow-left",
    },
    viewBox: {
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
    },
    nodes: [
      {
        kind: "line",
        x1: 20,
        y1: 12,
        x2: shaftStartX,
        y2: 12,
      },
      {
        kind: "polyline",
        points: [
          { x: 10, y: 6 },
          { x: 4, y: 12 },
          { x: 10, y: 18 },
        ],
      },
    ],
    metadata: {
      displayName: "Arrow Left",
      rtl: "mirror",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 1.5,
          strokeLineCap: "round",
          strokeLineJoin: "round",
        },
        overrides: [],
        defaultSize: 24,
        minimumSize: 16,
      },
      licence: "ISC",
      attribution: "BlueLuscious",
      deprecated: false,
    },
  });
}

function collectionMetadata(): CollectionMetadataSource {
  const source = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "workflow/aster/metadata/collection.json",
    collection: "aster",
    content: JSON.stringify({
      schemaVersion: 1,
      name: "Aster",
      slug: "aster",
      status: "experimental",
      description: "Geometric outline interface icons.",
      package: {
        name: "@aster/icons",
        version: "0.0.0",
      },
      licence: "ISC",
      attribution: "BlueLuscious",
      allowIconLicenceOverride: false,
      defaultSize: 24,
      minimumSize: 16,
      presentationDefaults: {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      },
      presentationOverrides: [],
      validation: {
        viewBox: {
          expected: {
            minX: 0,
            minY: 0,
            width: 24,
            height: 24,
          },
          severity: "error",
        },
        stroke: {
          acceptedWidths: [1.5],
          severity: "error",
        },
        grid: {
          step: 0.5,
          severity: "warning",
        },
        bounds: {
          inset: [2, 2, 2, 2],
          severity: "warning",
        },
        complexity: {
          maxPrimitives: 16,
          maxPathCommands: 64,
          severity: "warning",
        },
      },
    }),
  });

  assert.equal(source.kind, "collection-metadata");

  if (source.kind !== "collection-metadata") {
    throw new Error("Expected collection metadata workflow source.");
  }

  return source;
}

function importedArrowLeftEntry(): CollectionBuildEntry {
  const identity = {
    collection: "aster",
    name: "arrow-left",
  };
  const svg = sourceFactory.create({
    kind: "svg",
    sourceId: "workflow/aster/svg/arrow-left.svg",
    identity,
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 6 4 12 10 18"/></svg>',
  });
  const metadata = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: "workflow/aster/metadata/icons/arrow-left.json",
    identity,
    content: JSON.stringify({
      schemaVersion: 1,
      name: "arrow-left",
      displayName: "Arrow Left",
      rtl: "mirror",
      deprecated: false,
    }),
  });

  assert.equal(svg.kind, "svg");
  assert.equal(metadata.kind, "icon-metadata");

  if (svg.kind !== "svg" || metadata.kind !== "icon-metadata") {
    throw new Error("Expected paired SVG import workflow sources.");
  }

  return { svg, metadata };
}

function buildImportRequest(): CollectionBuildRequest {
  return {
    collectionMetadata: collectionMetadata(),
    entries: [importedArrowLeftEntry()],
  };
}

function readGeneratedDefinition(content: string): IconDefinition {
  const match = /\$Icon\.define\(([\s\S]+)\);\s*$/u.exec(content);

  assert.ok(match?.[1] !== undefined);
  return JSON.parse(match[1]) as IconDefinition;
}

test("authors one portable definition and renders deterministic review SVG", () => {
  const definition = authorArrowLeft();
  const first = Svg.render(definition);
  const second = Svg.render(definition);

  assert.equal(first, second);
  assert.equal(
    first,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><line x1="20" y1="12" x2="4" y2="12" fill="none" fill-rule="nonzero" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/><polyline points="10 6 4 12 10 18" fill="none" fill-rule="nonzero" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
  assert.doesNotMatch(first, /Arrow Left|mirror|ISC|BlueLuscious/u);
});

test("imports equivalent SVG and JSON into the same portable definition", () => {
  const result = pipeline.build(buildImportRequest());

  assert.equal(
    result.successful,
    true,
    JSON.stringify(result.diagnostics, null, 2),
  );

  if (!result.successful) {
    throw new Error("Expected successful equivalent SVG workflow import.");
  }

  assert.deepEqual(result.diagnostics, []);

  const iconModule = result.value.files.find(
    (file) => file.path === "src/icons/arrow-left.ts",
  );

  assert.ok(iconModule !== undefined);
  assert.match(iconModule.content, /export const ArrowLeft = \$Icon\.define/u);
  assert.deepEqual(
    readGeneratedDefinition(iconModule.content),
    authorArrowLeft(),
  );
});

test("corrects an off-grid review finding in canonical TypeScript source", () => {
  const draft = Svg.render(authorArrowLeft(3.75));
  const corrected = Svg.render(authorArrowLeft());

  assert.match(draft, /x2="3\.75"/u);
  assert.doesNotMatch(corrected, /3\.75/u);
  assert.match(corrected, /x2="4"/u);
});
