import assert from "node:assert/strict";
import test from "node:test";

import { Icon, type IconCircleNode } from "@luscious-garden/aster-core";
import { Amellus } from "../../src/collections/a/amellus/amellus.collection.js";
import { AsterIconLoaders } from "../../src/dynamic/index.js";
import { CameraVariants } from "../../src/generated/facades/glyphs/camera.js";
import { CameraBeaded } from "../../src/generated/facades/icons/camera/beaded.js";
import { CameraDotted } from "../../src/generated/facades/icons/camera/dotted.js";
import { CameraFilled } from "../../src/generated/facades/icons/camera/filled.js";
import { CameraOutline } from "../../src/generated/facades/icons/camera/outline.js";

test("distributes every approved Camera treatment without expanding Amellus implicitly", async () => {
  assert.deepEqual(Object.keys(CameraVariants), [
    "beaded", "dotted", "filled", "outline",
  ]);
  assert.deepEqual(Object.keys(Amellus.icons.camera), ["outline", "filled"]);

  for (const definition of [CameraOutline, CameraFilled, CameraDotted, CameraBeaded]) {
    const variant = definition.identity.variant as keyof typeof CameraVariants;
    assert.equal(CameraVariants[variant], definition);
    assert.equal(Icon.define(definition), definition);
    const loader = AsterIconLoaders[`aster/camera@${variant}`];
    assert.ok(loader);
    assert.equal(await loader(), definition);
    assert.equal(
      Amellus.members.includes(definition),
      variant === "outline" || variant === "filled",
    );
  }
  assert.equal(Amellus.icons.camera.outline, CameraOutline);
  assert.equal(Amellus.icons.camera.filled, CameraFilled);
});

test("retains Outline's body and complementary lens bounds in Camera Filled", () => {
  const outlineBody = CameraOutline.nodes[0];
  const outlineLens = CameraOutline.nodes[1];
  const filledDisc = CameraFilled.nodes[0];
  const filledBody = CameraFilled.nodes[1];
  assert.ok(outlineBody?.kind === "path");
  assert.ok(outlineLens?.kind === "circle");
  assert.ok(filledDisc?.kind === "circle");
  assert.ok(filledBody?.kind === "path");
  assert.equal(CameraFilled.nodes.length, 2);
  assert.equal(outlineBody.commands.length, 14);
  assert.equal(filledBody.commands.length, 18);
  assert.deepEqual(filledBody.commands.slice(0, 14), outlineBody.commands);
  assert.deepEqual(filledBody.commands.slice(14), [
    { kind: "move", x: 12, y: 18 },
    {
      kind: "arc", x: 12, y: 8, radiusX: 5, radiusY: 5,
      rotation: 0, largeArc: false, sweep: false,
    },
    {
      kind: "arc", x: 12, y: 18, radiusX: 5, radiusY: 5,
      rotation: 0, largeArc: false, sweep: false,
    },
    { kind: "close" },
  ]);
  assert.deepEqual(filledDisc, { kind: "circle", cx: 12, cy: 13, radius: 2 });
  const outlinePresentation = CameraOutline.metadata.presentation;
  const filledPresentation = CameraFilled.metadata.presentation;
  assert.ok(outlinePresentation);
  assert.ok(filledPresentation);
  assert.deepEqual(filledPresentation, {
    ...outlinePresentation,
    defaults: { ...outlinePresentation.defaults, fill: "currentColor" },
  });
  const strokeWidth = filledPresentation.defaults.strokeWidth;
  assert.ok(strokeWidth !== undefined);
  const halfStroke = strokeWidth / 2;
  assert.equal(filledDisc.radius + halfStroke, outlineLens.radius - halfStroke);
  assert.equal(5 - halfStroke, outlineLens.radius + halfStroke);
  assert.equal(Object.hasOwn(filledBody, "fillRule"), false);
});

test("keeps Dotted and Beaded as native circles with the same symmetric centres", () => {
  assert.equal(CameraDotted.nodes.length, 66);
  assert.equal(CameraBeaded.nodes.length, 66);
  const dotted = CameraDotted.nodes.filter(
    (node): node is IconCircleNode => node.kind === "circle",
  );
  const beaded = CameraBeaded.nodes.filter(
    (node): node is IconCircleNode => node.kind === "circle",
  );
  assert.equal(dotted.length, 66);
  assert.equal(beaded.length, 66);
  assert.deepEqual(beaded, dotted.map((node) => ({ ...node, radius: 0.75 })));
  assert.ok(dotted.every(({ radius }) => radius === 0.5));
  assert.equal(new Set(dotted.map(({ cx, cy }) => `${cx},${cy}`)).size, 66);

  for (const { cx, cy } of dotted) {
    assert.ok(dotted.some((node) =>
      Math.abs(node.cx - (24 - cx)) < 1e-9 && node.cy === cy
    ));
    assert.ok(Math.abs(cx * 1000 - Math.round(cx * 1000)) < 1e-9);
    assert.ok(Math.abs(cy * 1000 - Math.round(cy * 1000)) < 1e-9);
  }
  for (const nodes of [dotted.slice(0, 50), dotted.slice(50)]) {
    const distances = nodes.map((node, index) => {
      const next = nodes[(index + 1) % nodes.length];
      assert.ok(next);
      return Math.hypot(next.cx - node.cx, next.cy - node.cy);
    });
    assert.ok(distances.every((distance) => distance > 1 && distance < 1.5));
    assert.ok(Math.max(...distances) - Math.min(...distances) < 0.053);
  }
  const lens = dotted.slice(50);
  for (const { cx, cy } of lens) {
    assert.ok(Math.abs(Math.hypot(cx - 12, cy - 13) - 3.5) < 0.001);
    assert.ok(lens.some((node) =>
      Math.abs(node.cx - (12 - (cy - 13))) < 1e-9
      && Math.abs(node.cy - (13 + cx - 12)) < 1e-9
    ));
  }
  for (const [left, top, right, bottom] of [
    [3, 6.5, 5, 8.5], [19, 6.5, 21, 8.5],
    [3, 17.5, 5.5, 20], [18.5, 17.5, 21, 20],
  ] as const) {
    assert.equal(dotted.filter(({ cx, cy }) =>
      cx > left && cx < right && cy > top && cy < bottom
    ).length, 3);
  }
  for (const definition of [CameraDotted, CameraBeaded]) {
    assert.deepEqual(definition.metadata.presentation, {
      defaults: { fill: "currentColor", stroke: "none" },
      overrides: [],
    });
  }
});
