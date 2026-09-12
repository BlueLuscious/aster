import assert from "node:assert/strict";
import test from "node:test";

import { AsterCatalogue, AsterCommands } from "@aster/cli";
import { AsterIcons } from "@aster/icons";
import { AmellusCollection } from "@aster/icons/collections/amellus";

const commandContext = Object.freeze({
  catalogues: Object.freeze([AsterCatalogue]),
  productName: "Aster",
  productVersion: "0.0.0",
});

test("exposes Amellus through every collection-neutral CLI workflow", async () => {
  const listed = await AsterCommands.execute(
    { command: "list", subject: "icons", collection: "amellus" },
    commandContext,
  );
  const searched = await AsterCommands.execute(
    { command: "search", query: "photograph", collection: "amellus" },
    commandContext,
  );
  const shown = await AsterCommands.execute(
    { command: "show", subject: "collection", identity: "amellus" },
    commandContext,
  );
  const exported = await AsterCommands.execute(
    { command: "export", subject: "collection", identity: "amellus" },
    commandContext,
  );
  const reviewed = await AsterCommands.execute(
    { command: "review", subject: "collection", identity: "amellus" },
    commandContext,
  );

  assert.equal(listed.ok, true, JSON.stringify(listed));
  assert.equal(searched.ok, true, JSON.stringify(searched));
  assert.equal(shown.ok, true, JSON.stringify(shown));
  assert.equal(exported.ok, true, JSON.stringify(exported));
  assert.equal(reviewed.ok, true, JSON.stringify(reviewed));

  if (
    !listed.ok || listed.payload.kind !== "icon-list" ||
    !searched.ok || searched.payload.kind !== "search" ||
    !shown.ok || shown.payload.kind !== "collection-show" ||
    !exported.ok || exported.payload.kind !== "export" ||
    !reviewed.ok || reviewed.payload.kind !== "review"
  ) {
    throw new Error("Expected complete Amellus command workflow results.");
  }

  assert.deepEqual(
    listed.payload.icons.map((result) => result.identity.name).sort(),
    AsterIcons.map((definition) => definition.identity.name).sort(),
  );
  assert.deepEqual(
    searched.payload.results.map((result) => result.identity.name),
    ["camera"],
  );
  assert.equal(shown.payload.collection.identity.name, "amellus");
  assert.equal(shown.payload.collection.icons.length, AmellusCollection.icons.length);
  assert.equal(exported.payload.plan.artefacts.length, AmellusCollection.icons.length);
  assert.equal(reviewed.payload.plan.document.kind, "collection");
  assert.equal(reviewed.payload.plan.document.icons.length, AmellusCollection.icons.length);
});
