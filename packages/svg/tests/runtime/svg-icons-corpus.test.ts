import assert from "node:assert/strict";
import test from "node:test";

import { AsterIcons } from "@aster/icons";
import { AsterCollection } from "@aster/icons/collections/aster";
import { Svg } from "../../src/index.js";

test("renders the complete real icon corpus deterministically", () => {
  const definitions = AsterIcons;
  const outputs = new Set<string>();

  assert.equal(definitions.length, AsterCollection.icons.length);

  for (const icon of definitions) {
    assert.ok(AsterCollection.icons.includes(icon));

    const scenarios = [
      Svg.render(icon),
      Svg.render(icon, { label: icon.metadata.displayName }),
      Svg.render(icon, { colour: "#123", size: 24 }),
      Svg.render(icon, { direction: "rtl" }),
    ];

    for (const markup of scenarios) {
      assert.match(markup, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/u);
      assert.match(markup, /<\/svg>$/u);
      outputs.add(markup);
    }

    assert.equal(scenarios[0], Svg.render(icon));
    assert.equal(
      scenarios[1],
      Svg.render(icon, { label: icon.metadata.displayName }),
    );
    assert.equal(
      scenarios[2],
      Svg.render(icon, { colour: "#112233", size: 24 }),
    );
    assert.equal(
      scenarios[3],
      Svg.render(icon, { direction: "rtl" }),
    );
  }

  assert.ok(outputs.size >= definitions.length);
});
