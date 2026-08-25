import assert from "node:assert/strict";
import test from "node:test";

import { AsterCollection } from "@aster/icons";
import { Svg } from "../../src/index.js";

test("renders the complete real icon corpus deterministically", () => {
  const outputs = new Set<string>();

  for (const icon of AsterCollection.icons) {
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

  assert.ok(outputs.size >= AsterCollection.icons.length);
});
