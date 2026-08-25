import assert from "node:assert/strict";
import test from "node:test";

import {
  AsterCatalogue,
  AsterCommands,
  exportTargets,
} from "../../src/index.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";

const context: AsterCommandContext = {
  catalogues: [AsterCatalogue],
  productName: "Aster",
  productVersion: "0.0.0",
};

test("plans one deterministic immutable icon SVG export", async () => {
  const first = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/camera",
    options: { size: 32, colour: "#123456", label: " Camera " },
  }, context);
  const second = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/camera",
    options: { size: 32, colour: "#123456", label: "Camera" },
  }, context);

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);

  if (first.ok && first.payload.kind === "export") {
    assert.equal(first.payload.plan.target, exportTargets.svg);
    assert.equal(first.payload.plan.subject, "icon");
    assert.equal(first.payload.plan.catalogue, "aster");
    assert.equal(first.payload.plan.identity, "aster/camera");
    assert.equal(first.payload.plan.artefacts.length, 1);
    assert.equal(first.payload.plan.artefacts[0]?.path, "aster/camera.svg");
    assert.equal(first.payload.plan.artefacts[0]?.mediaType, "image/svg+xml");
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /^<svg /u);
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /width="32"/u);
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /aria-label="Camera"/u);
    assert.ok(Object.isFrozen(first.payload));
    assert.ok(Object.isFrozen(first.payload.plan));
    assert.ok(Object.isFrozen(first.payload.plan.artefacts));
    assert.ok(Object.isFrozen(first.payload.plan.artefacts[0]));
  }
});

test("plans collection members in canonical path order", async () => {
  const result = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "aster",
  }, context);

  assert.equal(result.ok, true);

  if (result.ok && result.payload.kind === "export") {
    const paths = result.payload.plan.artefacts.map((artefact) => artefact.path);
    assert.equal(result.payload.plan.subject, "collection");
    assert.equal(paths.length, 16);
    assert.deepEqual(paths, [...paths].sort());
    assert.equal(new Set(paths).size, paths.length);
  }
});

test("preserves existing exact lookup failures for export", async () => {
  const result = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/missing",
  }, context);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "not-found");
    assert.equal(result.diagnostic.code, "ASTER-CLI-004");
  }
});
