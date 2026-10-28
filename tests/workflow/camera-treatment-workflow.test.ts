import assert from "node:assert/strict";
import test from "node:test";

import {
  AsterCatalogue,
  AsterCommands,
  type CatalogueProvider,
} from "@luscious-garden/aster-cli";
import { Amellus } from "@luscious-garden/aster-icons/collections/amellus";
import { CameraVariants } from "@luscious-garden/aster-icons/camera";
import { Svg } from "@luscious-garden/aster-svg";

const commandContext = Object.freeze({
  catalogues: Object.freeze([AsterCatalogue]),
  productName: "Aster",
  productVersion: "0.0.0",
});

test("discovers all Camera treatments and selective memberships without definition loaders", async () => {
  let definitionLoads = 0;
  const metadataOnlyProvider = {
    identity: AsterCatalogue.identity,
    discover: () => AsterCatalogue.discover(),
    async loadIcon() {
      definitionLoads += 1;
      throw new Error("Unexpected icon load during Camera discovery.");
    },
    async loadCollection() {
      definitionLoads += 1;
      throw new Error("Unexpected collection load during Camera discovery.");
    },
  } satisfies CatalogueProvider;
  const context = { ...commandContext, catalogues: [metadataOnlyProvider] };
  const shown = await AsterCommands.execute(
    { command: "show", subject: "glyph", identity: "aster/camera" },
    context,
  );
  const listed = await AsterCommands.execute(
    { command: "list", subject: "icons", glyph: "aster/camera" },
    context,
  );

  assert.ok(shown.ok && shown.payload.kind === "glyph-show", JSON.stringify(shown));
  assert.ok(listed.ok && listed.payload.kind === "icon-list", JSON.stringify(listed));
  assert.deepEqual(shown.payload.glyph.identity, { namespace: "aster", name: "camera" });
  assert.equal(shown.payload.glyph.catalogue, AsterCatalogue.identity);
  assert.deepEqual(shown.payload.glyph.variants, listed.payload.icons);
  assert.deepEqual(
    listed.payload.icons.map(({ identity }) => identity.variant),
    Object.keys(CameraVariants),
  );

  for (const icon of listed.payload.icons) {
    const selected = icon.identity.variant === "outline" || icon.identity.variant === "filled";
    assert.deepEqual(icon.memberships, selected ? [Amellus.identity] : []);
    assert.equal("nodes" in icon, false);
    assert.equal("viewBox" in icon, false);
    assert.equal("presentation" in icon.metadata, false);
    const result = await AsterCommands.execute(
      {
        command: "show",
        subject: "icon",
        identity: `aster/camera@${icon.identity.variant}`,
      },
      context,
    );
    assert.ok(result.ok && result.payload.kind === "icon-show", JSON.stringify(result));
    assert.deepEqual(result.payload.icon, icon);
  }

  assert.equal(definitionLoads, 0);
});

test("exports and reviews every Camera treatment without expanding the Amellus selection", async () => {
  for (const definition of Object.values(CameraVariants)) {
    const identity = `aster/camera@${definition.identity.variant}`;
    assert.equal(await AsterCatalogue.loadIcon(definition.identity), definition);
    const exported = await AsterCommands.execute(
      { command: "export", subject: "icon", identity },
      commandContext,
    );
    const reviewed = await AsterCommands.execute(
      { command: "review", subject: "icon", identity },
      commandContext,
    );
    assert.ok(exported.ok && exported.payload.kind === "export", JSON.stringify(exported));
    assert.ok(reviewed.ok && reviewed.payload.kind === "review", JSON.stringify(reviewed));
    assert.equal(exported.payload.plan.artefacts.length, 1);
    assert.equal(exported.payload.plan.artefacts[0]?.content, Svg.render(definition));
    const document = reviewed.payload.plan.document;
    assert.ok(document.kind === "icon");
    assert.deepEqual(document.icon.identity, definition.identity);
    assert.deepEqual(document.icon.metadata, definition.metadata);
    assert.deepEqual(document.icon.viewBox, definition.viewBox);
    assert.equal(document.icon.nodeCount, definition.nodes.length);
    assert.deepEqual(
      document.icon.primitiveKinds,
      [...new Set(definition.nodes.map(({ kind }) => kind))].sort(),
    );
    assert.deepEqual(
      document.icon.memberships,
      Amellus.members.includes(definition) ? [Amellus.identity] : [],
    );
    assert.equal(document.icon.markup, Svg.render(definition));

    for (const size of [16, 24, 32, 48]) {
      for (const colour of ["#111111", "#ffffff", "#007a70"]) {
        const markup = Svg.render(definition, { size, colour });
        assert.equal(markup, Svg.render(definition, { size, colour }));
        assert.match(markup, new RegExp(`width="${size}" height="${size}"`));
        assert.equal(markup.match(/data-rendered-by="Aster"/gu)?.length, 1);
        assert.equal(markup.includes("<path"), definition.identity.variant !== "dotted"
          && definition.identity.variant !== "beaded");
      }
    }
  }

  const reviewed = await AsterCommands.execute(
    { command: "review", subject: "collection", identity: "amellus" },
    commandContext,
  );
  assert.ok(reviewed.ok && reviewed.payload.kind === "review", JSON.stringify(reviewed));
  const document = reviewed.payload.plan.document;
  assert.ok(document.kind === "collection");
  assert.deepEqual(
    document.icons.filter(({ identity }) => identity.name === "camera")
      .map(({ identity }) => identity.variant),
    ["filled", "outline"],
  );
});
