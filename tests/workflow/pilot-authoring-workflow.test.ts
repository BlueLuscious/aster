import assert from "node:assert/strict";
import test from "node:test";

import { IconImport, iconImportFormats } from "@aster/import";
import { Icon, type IconDefinition, type IconMetadata } from "@aster/core";
import { ArrowLeft } from "@aster/icons";
import { AsterCollection } from "@aster/icons/collections/aster";
import { Svg } from "@aster/svg";

const arrowMetadata: IconMetadata = {
  displayName: "Arrow Left",
  tags: ["arrow", "back", "left", "navigation", "previous"],
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
};

function authorArrowLeft(shaftStartX = 4): IconDefinition {
  return Icon.define({
    identity: { namespace: "aster", name: "arrow-left" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [
      { kind: "line", x1: 20, y1: 12, x2: shaftStartX, y2: 12 },
      {
        kind: "polyline",
        points: [
          { x: 10, y: 6 },
          { x: 4, y: 12 },
          { x: 10, y: 18 },
        ],
      },
    ],
    metadata: arrowMetadata,
  });
}

function readAdoptedDefinition(content: string): IconDefinition {
  const match = /\$Icon\.define\(([\s\S]+)\);\s*$/u.exec(content);
  assert.ok(match?.[1] !== undefined);
  return JSON.parse(match[1]) as IconDefinition;
}

function adoptionRequest(
  namespace: string,
  name: string,
  geometry: string,
): Parameters<typeof IconImport.adopt>[0] {
  return {
    source: {
      format: iconImportFormats.svg,
      sourceId: `workflow/${namespace}/${name}.svg`,
      identity: { namespace, name },
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${geometry}</svg>`,
    },
    metadata: {
      ...arrowMetadata,
      displayName: name,
      tags: [namespace, name],
    },
  };
}

test("authors one portable definition and renders deterministic review SVG", () => {
  const definition = authorArrowLeft();
  assert.equal(Svg.render(definition), Svg.render(definition));
  assert.doesNotMatch(Svg.render(definition), /Arrow Left|mirror|ISC|BlueLuscious/u);
});

test("adopts equivalent SVG into editable TypeScript and the same portable definition", () => {
  const result = IconImport.adopt({
    source: {
      format: iconImportFormats.svg,
      sourceId: "workflow/aster/svg/arrow-left.svg",
      identity: { namespace: "aster", name: "arrow-left" },
      content:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><line x1="20" y1="12" x2="4" y2="12"/><polyline points="10 6 4 12 10 18"/></svg>',
    },
    metadata: arrowMetadata,
  });

  assert.equal(result.successful, true, JSON.stringify(result.diagnostics, null, 2));

  if (!result.successful) {
    throw new Error("Expected successful SVG adoption workflow.");
  }

  assert.doesNotMatch(result.value.module.content, /@generated|Do not edit/iu);
  const adopted = Icon.define(readAdoptedDefinition(result.value.module.content));
  assert.deepEqual(adopted, authorArrowLeft());
  assert.equal(Svg.render(adopted), Svg.render(authorArrowLeft()));
});

test("corrects an off-grid review finding in canonical TypeScript source", () => {
  const draft = Svg.render(authorArrowLeft(3.75));
  const corrected = Svg.render(authorArrowLeft());
  assert.match(draft, /x2="3\.75"/u);
  assert.doesNotMatch(corrected, /3\.75/u);
  assert.match(corrected, /x2="4"/u);
});

test("adopts independent host-owned batches into renderable editable definitions", () => {
  const flora = IconImport.adoptMany([
    adoptionRequest("flora", "leaf", '<path d="M4 20C4 10 10 4 20 4"/>'),
    adoptionRequest("flora", "seed", '<circle cx="12" cy="12" r="4"/>'),
  ]);
  const weather = IconImport.adoptMany([
    adoptionRequest("weather", "sun", '<circle cx="12" cy="12" r="6"/>'),
  ]);

  assert.equal(flora.successful, true, JSON.stringify(flora.diagnostics, null, 2));
  assert.equal(weather.successful, true, JSON.stringify(weather.diagnostics, null, 2));

  if (!flora.successful || !weather.successful) {
    throw new Error("Expected successful independent host batches.");
  }

  const floraDefinitions = flora.value.entries.map((entry) =>
    Icon.define(readAdoptedDefinition(entry.module.content)),
  );
  const weatherDefinitions = weather.value.entries.map((entry) =>
    Icon.define(readAdoptedDefinition(entry.module.content)),
  );

  assert.deepEqual(
    floraDefinitions.map((definition) => definition.identity.name),
    ["leaf", "seed"],
  );
  assert.deepEqual(
    weatherDefinitions.map((definition) => definition.identity.name),
    ["sun"],
  );
  assert.ok(
    [...floraDefinitions, ...weatherDefinitions].every((definition) =>
      Svg.render(definition).startsWith("<svg "),
    ),
  );
});

test("renders every independently authored pilot icon distinctly", () => {
  assert.deepEqual(ArrowLeft, authorArrowLeft());
  const definitions = AsterCollection.icons;
  const markup = definitions.map((definition) => Svg.render(definition));
  assert.equal(definitions.length, 16);
  assert.equal(new Set(markup).size, definitions.length);
});
