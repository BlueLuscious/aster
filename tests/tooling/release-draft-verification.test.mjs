import assert from "node:assert/strict";
import test from "node:test";

import { ReleaseDraftVerifier } from "../../tooling/release/runtime/release-draft.verifier.mjs";

const sourceCommit = "e5b83299bd755f61fd17dae4769ef10b4f15c22c";
const sha256 =
  "263DCFECF88DFDD6B7119D02591686BC94C3DC6637DB53800249468194354B33";
const intent = Object.freeze({
  sourceCommit,
  sha256,
  tag: "core/v0.1.0",
  title: "Aster Core 0.1.0",
  body: "Published Core notes.",
  archiveName: "luscious-garden-aster-core-0.1.0.tgz",
});

function fixture(overrides = {}) {
  const requests = [];
  const fetchResponse = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.includes("/git/ref/tags/")) {
      return Response.json({
        ref: `refs/tags/${intent.tag}`,
        object: { type: "commit", sha: overrides.tagCommit ?? sourceCommit },
      });
    }
    if (url.endsWith("/releases/42")) {
      if (overrides.releaseStatus) {
        return new Response(null, { status: overrides.releaseStatus });
      }
      return Response.json({
        id: overrides.releaseId ?? 42,
        tag_name: intent.tag,
        draft: overrides.draft ?? true,
        prerelease: false,
        name: intent.title,
        body: intent.body,
        html_url:
          "https://github.com/BlueLuscious/aster/releases/tag/core/v0.1.0",
        assets: [
          {
            name: intent.archiveName,
            state: "uploaded",
            digest: overrides.digest ?? `sha256:${sha256.toLowerCase()}`,
          },
        ],
      });
    }
    throw new Error(`Unexpected GitHub request: ${url}`);
  };
  return {
    requests,
    verifier: new ReleaseDraftVerifier({
      repository: "BlueLuscious/aster",
      token: "read-test-token",
      fetchResponse,
    }),
  };
}

test("reads back an exact unpublished draft and its npm-identical asset", async () => {
  const { verifier, requests } = fixture();
  assert.equal(
    await verifier.verify(intent, 42),
    "https://github.com/BlueLuscious/aster/releases/tag/core/v0.1.0",
  );
  assert.equal(requests.length, 2);
  assert.equal(
    requests[1],
    "https://api.github.com/repos/BlueLuscious/aster/releases/42",
  );
});

test("rejects wrong tag target, publication state or uploaded digest", async () => {
  await assert.rejects(
    fixture({ tagCommit: "0".repeat(40) }).verifier.verify(intent, 42),
    /does not target/u,
  );
  await assert.rejects(
    fixture({ draft: false }).verifier.verify(intent, 42),
    /classification, title or notes differ/u,
  );
  await assert.rejects(
    fixture({ releaseId: 41 }).verifier.verify(intent, 42),
    /classification, title or notes differ/u,
  );
  await assert.rejects(
    fixture({ digest: "sha256:wrong" }).verifier.verify(intent, 42),
    /differs from the approved npm archive/u,
  );
  await assert.rejects(
    fixture({ releaseStatus: 404 }).verifier.verify(intent, 42),
    /inspection failed: HTTP 404/u,
  );
  await assert.rejects(
    fixture().verifier.verify(intent, 0),
    /valid release ID/u,
  );
});
