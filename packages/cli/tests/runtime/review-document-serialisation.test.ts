import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { Collection, Icon } from "@aster/core";
import {
  AsterCatalogue,
  AsterCommands,
  type AsterReviewPlan,
} from "../../src/index.js";
import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../src/catalogue/contracts/index.js";
import { HtmlContentEscaper } from "../../src/review/runtime/html-content.escaper.js";
import { ReviewDocumentSerialiser } from "../../src/review/runtime/review-document.serialiser.js";

const presentation = Object.freeze({
  defaults: Object.freeze({
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.5,
  }),
  overrides: Object.freeze([]),
});

async function plan(
  subject: "icon" | "collection",
  identity: string,
  catalogues: readonly CatalogueProvider[] = [AsterCatalogue],
): Promise<AsterReviewPlan> {
  const result = await AsterCommands.execute({
    command: "review",
    subject,
    identity,
  }, {
    catalogues,
    productName: "Aster",
    productVersion: "0.0.0",
  });

  assert.equal(result.ok, true);

  if (!result.ok || result.payload.kind !== "review") {
    throw new TypeError("Expected one accepted review plan");
  }

  return result.payload.plan;
}

test("serialises byte-identical self-contained icon evidence", async () => {
  const serialiser = new ReviewDocumentSerialiser();
  const review = await plan("icon", "aster/camera");
  const first = serialiser.serialise(review);
  const second = serialiser.serialise(review);

  assert.equal(first, second);
  assert.equal(first.endsWith("\n"), true);
  assert.equal(first.includes("\r"), false);
  assert.match(first, /^<!doctype html>\n<html lang="en-GB">/u);
  assert.match(first, /<header class="review-header">/u);
  assert.match(first, /<main class="review-main">/u);
  assert.match(first, /Representative palettes/u);
  assert.match(first, /16 px[\s\S]*24 px[\s\S]*32 px[\s\S]*48 px/u);
  assert.match(first, /Regular comparison grid/u);
  assert.match(first, /No safe-area profile is retained/u);
  assert.doesNotMatch(first, /<script|<link|<img|@import|url\(/u);

  const digest = createHash("sha256").update(first).digest("hex");
  assert.equal(digest, "5780db9a8938167e1a121c7dc56af940c63fcab8ac5a0dbb5e155fcf4fd0793b");
});

test("serialises collections in canonical navigable order", async () => {
  const serialiser = new ReviewDocumentSerialiser();
  const review = await plan("collection", "aster");
  const html = serialiser.serialise(review);
  const arrow = html.indexOf('href="#icon-aster%2Farrow-left"');
  const bell = html.indexOf('href="#icon-aster%2Fbell"');
  const camera = html.indexOf('href="#icon-aster%2Fcamera"');

  assert.ok(arrow > -1);
  assert.ok(arrow < bell);
  assert.ok(bell < camera);
  assert.match(html, /id="contact-sheet"/u);
  assert.match(html, /id="icon-details"/u);
  assert.match(html, /aria-label="Review sections"/u);
});

test("escapes hostile authored text and explicit attribute contexts", async () => {
  const dangerous = '</title><script>alert("review")</script> & danger';
  const icon = Icon.define({
    identity: { namespace: "testing", name: "hostile" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "path", data: "M1 1L23 23" }],
    metadata: {
      displayName: dangerous,
      tags: ["safe-tag"],
      rtl: "preserve",
      presentation,
      deprecated: false,
    },
  });
  const collection = Collection.define({
    identity: { namespace: "testing", name: "hostile" },
    icons: [icon],
    metadata: {
      displayName: dangerous,
      description: "<strong>not markup</strong>",
      tags: ["review-escape"],
    },
  });
  const snapshot: CatalogueSnapshot = {
    icons: [{ definition: icon, memberships: [collection.identity] }],
    collections: [{ definition: collection }],
  };
  const provider: CatalogueProvider = {
    identity: "testing",
    async load() {
      return snapshot;
    },
  };
  const serialiser = new ReviewDocumentSerialiser();
  const html = serialiser.serialise(
    await plan("collection", "testing/hostile", [provider]),
  );
  const escaper = new HtmlContentEscaper();

  assert.doesNotMatch(html, /<script>alert/u);
  assert.doesNotMatch(html, /<strong>not markup<\/strong>/u);
  assert.match(
    html,
    /&lt;\/title&gt;&lt;script&gt;alert\("review"\)&lt;\/script&gt; &amp; danger/u,
  );
  assert.match(html, /&lt;strong&gt;not markup&lt;\/strong&gt;/u);
  assert.equal(
    escaper.attribute(`&<>"'`),
    "&amp;&lt;&gt;&quot;&#39;",
  );
});

test("renders an explicit empty collection state", async () => {
  const collection = Collection.define({
    identity: { namespace: "testing", name: "empty" },
    icons: [],
    metadata: { displayName: "Empty" },
  });
  const provider: CatalogueProvider = {
    identity: "testing",
    async load() {
      return { icons: [], collections: [{ definition: collection }] };
    },
  };
  const html = new ReviewDocumentSerialiser().serialise(
    await plan("collection", "testing/empty", [provider]),
  );

  assert.match(html, /This collection contains no icons\./u);
  assert.doesNotMatch(html, /id="icon-details"/u);
});
