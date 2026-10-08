import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { releaseApprovalDigest } from "../../tooling/release/runtime/release-approval.digest.mjs";
import { ReleaseDraftCreator } from "../../tooling/release/runtime/release-draft.creator.mjs";

const repository = "BlueLuscious/aster";
const sourceCommit = "e5b83299bd755f61fd17dae4769ef10b4f15c22c";
const archive = Buffer.from("published npm package archive");
const approvedFields = {
  tag: "core/v0.1.0",
  title: "Aster Core 0.1.0",
  body: "Approved Core release notes.",
  sourceCommit,
  archiveName: "luscious-garden-aster-core-0.1.0.tgz",
  archiveUrl:
    "https://registry.npmjs.org/@luscious-garden/aster-core/-/aster-core-0.1.0.tgz",
  sha256: createHash("sha256").update(archive).digest("hex").toUpperCase(),
};
const intent = Object.freeze({
  ...approvedFields,
  releasePreflight: "authenticated",
  approvalSha256: releaseApprovalDigest(approvedFields),
});

function fixture(overrides = {}) {
  const requests = [];
  const fetchResponse = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });
    if (url.endsWith(`/git/ref/tags/${intent.tag}`)) {
      if (overrides.tagStatus) {
        return new Response(null, { status: overrides.tagStatus });
      }
      return Response.json({
        ref: `refs/tags/${intent.tag}`,
        object: { type: "commit", sha: overrides.tagCommit ?? sourceCommit },
      });
    }
    if (url.endsWith("/releases") && init.method === "POST") {
      if (overrides.releaseStatus) {
        return new Response(null, { status: overrides.releaseStatus });
      }
      return Response.json(
        {
          id: 42,
          tag_name: intent.tag,
          name: intent.title,
          body: intent.body,
          draft: true,
          prerelease: false,
          upload_url:
            overrides.uploadUrl ??
            `https://uploads.github.com/repos/${repository}/releases/42/assets{?name,label}`,
        },
        { status: 201 },
      );
    }
    if (
      url.startsWith(
        `https://uploads.github.com/repos/${repository}/releases/42/assets?`,
      )
    ) {
      return Response.json(
        {
          name: intent.archiveName,
          state: "uploaded",
          size: archive.byteLength,
          digest:
            overrides.assetDigest ?? `sha256:${intent.sha256.toLowerCase()}`,
        },
        { status: overrides.uploadStatus ?? 201 },
      );
    }
    throw new Error(`Unexpected GitHub request: ${url}`);
  };
  return {
    requests,
    creator: new ReleaseDraftCreator({
      repository,
      token: "write-test-token",
      fetchResponse,
    }),
  };
}

test("creates only an approved draft against an existing tag and uploads the exact npm bytes", async () => {
  const { creator, requests } = fixture();
  const draft = await creator.createDraft(intent, archive);
  assert.equal(draft.id, 42);
  await creator.uploadArchive(intent, draft, archive);

  assert.equal(requests.length, 3);
  assert.equal(requests[0].init.method, "GET");
  assert.equal(
    requests[1].url,
    `https://api.github.com/repos/${repository}/releases`,
  );
  assert.deepEqual(JSON.parse(requests[1].init.body), {
    tag_name: intent.tag,
    name: intent.title,
    body: intent.body,
    draft: true,
    prerelease: false,
    generate_release_notes: false,
  });
  assert.equal(
    requests[2].init.headers["Content-Type"],
    "application/octet-stream",
  );
  assert.deepEqual(requests[2].init.body, archive);
  assert.ok(
    requests.every(
      ({ init }) => init.headers.Authorization === "Bearer write-test-token",
    ),
  );
  assert.ok(requests.every(({ init }) => init.redirect === "error"));
});

test("rejects changed approvals and archives before any remote write", async () => {
  const { creator, requests } = fixture();
  await assert.rejects(
    creator.createDraft({ ...intent, releasePreflight: "public" }, archive),
    /not approved/u,
  );
  await assert.rejects(
    creator.createDraft({ ...intent, title: "Changed title" }, archive),
    /not approved/u,
  );
  await assert.rejects(
    creator.createDraft(intent, Buffer.from("different bytes")),
    /differs from the approved npm bytes/u,
  );
  assert.equal(requests.length, 0);
});

test("stops before draft creation when the tag target differs", async () => {
  const { creator, requests } = fixture({ tagCommit: "0".repeat(40) });
  await assert.rejects(
    creator.createDraft(intent, archive),
    /does not target/u,
  );
  assert.equal(requests.length, 1);
  await assert.rejects(
    fixture({ tagStatus: 404 }).creator.createDraft(intent, archive),
    /tag inspection failed: HTTP 404/u,
  );
});

test("does not upload or update an existing release after a creation conflict", async () => {
  const { creator, requests } = fixture({ releaseStatus: 422 });
  await assert.rejects(
    creator.createDraft(intent, archive),
    /draft creation failed: HTTP 422/u,
  );
  assert.equal(requests.length, 2);
  assert.equal(requests[1].init.method, "POST");
});

test("rejects an unexpected upload endpoint or digest without forwarding credentials", async () => {
  const wrongUrl = fixture({
    uploadUrl: "https://example.com/stolen{?name,label}",
  });
  await assert.rejects(
    wrongUrl.creator.createDraft(intent, archive),
    /upload URL does not belong/u,
  );
  assert.equal(wrongUrl.requests.length, 2);

  const wrongDigest = fixture({ assetDigest: "sha256:wrong" });
  const draft = await wrongDigest.creator.createDraft(intent, archive);
  await assert.rejects(
    wrongDigest.creator.uploadArchive(intent, draft, archive),
    /differs from the approved npm archive/u,
  );

  const failedUpload = fixture({ uploadStatus: 403 });
  const created = await failedUpload.creator.createDraft(intent, archive);
  await assert.rejects(
    failedUpload.creator.uploadArchive(intent, created, archive),
    /archive upload failed: HTTP 403/u,
  );
});
