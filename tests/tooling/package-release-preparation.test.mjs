import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { PackageReleasePreparer } from "../../tooling/release/runtime/package-release.preparer.mjs";

const sourceCommit = "e5b83299bd755f61fd17dae4769ef10b4f15c22c";
const version = "0.1.0";
const archive = Buffer.from("published npm archive");
const sha256 = createHash("sha256").update(archive).digest("hex").toUpperCase();

function fixture(overrides = {}) {
  const slug = overrides.slug ?? "core";
  const packageName = `@luscious-garden/aster-${slug}`;
  const githubApi = "https://api.github.com/repos/BlueLuscious/aster";
  const requests = [];
  const title = slug === "svg" ? "SVG" : slug[0].toUpperCase() + slug.slice(1);
  const notes = [
    `# Aster ${title} ${version}`,
    "",
    "Status: **Published on 8 October 2026**.",
    "",
    `Source commit: \`${sourceCommit}\`.`,
    "",
    `Registry: [npm](https://www.npmjs.com/package/${packageName}/v/${version})`,
    "",
    `Approved archive SHA-256: \`${overrides.noteHash ?? sha256}\`.`,
    "",
    "See the [migration](0.1.0-rc.2.md) and [policy](../../../project/versioning.md).",
    "",
  ].join("\n");
  const dependencies =
    slug === "core" ? {} : { "@luscious-garden/aster-core": "^0.1.0" };

  const git = async (...args) => {
    if (args[0] === "cat-file") {
      return "commit\n";
    }
    if (args[0] === "merge-base") {
      return "";
    }
    if (args[1] === `${sourceCommit}:package.json`) {
      return JSON.stringify({
        repository: { url: "git+https://github.com/BlueLuscious/aster.git" },
      });
    }
    if (args[1] === `${sourceCommit}:packages/${slug}/package.json`) {
      return JSON.stringify({
        name: packageName,
        version: overrides.sourceVersion ?? version,
        dependencies: Object.fromEntries(
          Object.keys(dependencies).map((name) => [name, "workspace:^"]),
        ),
      });
    }
    throw new Error(`Unexpected Git command: ${args.join(" ")}`);
  };

  const fetchResponse = async (input, init) => {
    const url = String(input);
    requests.push({ url, headers: init.headers });
    if (
      url.startsWith("https://registry.npmjs.org/") &&
      !url.endsWith(".tgz")
    ) {
      return Response.json({
        name: packageName,
        version,
        dependencies,
        dist: {
          tarball: `https://registry.npmjs.org/@luscious-garden/aster-${slug}/-/aster-${slug}-${version}.tgz`,
        },
      });
    }
    if (url.endsWith(".tgz")) {
      return new Response(archive);
    }
    if (url.includes("/actions/workflows/ci.yaml/runs?")) {
      return Response.json({
        workflow_runs: [
          {
            head_sha: sourceCommit,
            head_branch: "master",
            event: "push",
            conclusion: overrides.ciConclusion ?? "success",
            jobs_url: `${githubApi}/actions/runs/42/jobs`,
            html_url: "https://github.com/BlueLuscious/aster/actions/runs/42",
          },
        ],
      });
    }
    if (url.includes("/actions/runs/42/jobs?")) {
      return Response.json({
        total_count: 2,
        jobs: [
          { name: "Verify repository (ubuntu-latest)", conclusion: "success" },
          {
            name: "Verify repository (windows-latest)",
            conclusion: overrides.windowsConclusion ?? "success",
          },
        ],
      });
    }
    if (url.includes("/git/ref/tags/")) {
      return new Response(null, { status: overrides.tagStatus ?? 404 });
    }
    if (url.includes("/releases/tags/")) {
      return new Response(null, { status: overrides.releaseStatus ?? 404 });
    }
    if (url.includes("/releases?")) {
      if (overrides.listingStatus) {
        return new Response(null, { status: overrides.listingStatus });
      }
      return Response.json(
        overrides.draft
          ? [{ tag_name: `${slug}/v${version}`, draft: true }]
          : [],
      );
    }
    throw new Error(`Unexpected HTTP request: ${url}`);
  };

  return {
    requests,
    preparer: new PackageReleasePreparer({
      workspaceRoot: "/repository",
      git,
      readText: async () => notes,
      fetchResponse,
      githubToken: "read-only-test-token",
      checkReleaseListing: overrides.checkReleaseListing ?? false,
    }),
  };
}

test("prepares each public package without remote writes or credential leakage", async () => {
  for (const slug of ["core", "icons", "svg", "cli"]) {
    const { preparer, requests } = fixture({ slug });
    const intent = await preparer.prepare(slug, version);

    assert.equal(intent.packageName, `@luscious-garden/aster-${slug}`);
    assert.equal(intent.tag, `${slug}/v${version}`);
    assert.equal(intent.sha256, sha256);
    assert.match(intent.approvalSha256, /^[0-9A-F]{64}$/u);
    assert.equal(
      intent.archiveName,
      `luscious-garden-aster-${slug}-${version}.tgz`,
    );
    assert.equal(intent.releasePreflight, "public");
    assert.ok(
      intent.body.includes(
        `blob/master/docs/en/packages/${slug}/releases/0.1.0-rc.2.md`,
      ),
    );
    assert.match(
      intent.body,
      /blob\/master\/docs\/en\/project\/versioning\.md/u,
    );
    assert.equal(requests.length, 6);
    assert.ok(
      requests.every(
        ({ url }) =>
          url.startsWith("https://registry.npmjs.org/") ||
          url.startsWith("https://api.github.com/"),
      ),
    );
    assert.ok(
      requests
        .filter(({ url }) => url.startsWith("https://registry.npmjs.org/"))
        .every(({ headers }) => !Object.hasOwn(headers, "Authorization")),
    );
  }
});

test("rejects notes that disagree with the npm archive", async () => {
  const { preparer, requests } = fixture({ noteHash: "0".repeat(64) });
  await assert.rejects(preparer.prepare("core", version), /SHA-256 differs/u);
  assert.ok(
    requests.every(({ url }) => !url.startsWith("https://api.github.com/")),
  );
});

test("rejects mismatched source manifests and unsupported packages", async () => {
  await assert.rejects(
    fixture({ sourceVersion: "0.2.0" }).preparer.prepare("core", version),
    /source manifest does not match/u,
  );
  await assert.rejects(
    fixture().preparer.prepare("import", version),
    /Unsupported public package/u,
  );
});

test("requires successful source CI on both platforms", async () => {
  await assert.rejects(
    fixture({ ciConclusion: "failure" }).preparer.prepare("core", version),
    /lacks a successful master push CI run/u,
  );
  await assert.rejects(
    fixture({ windowsConclusion: "failure" }).preparer.prepare("core", version),
    /windows-latest CI job did not pass/u,
  );
});

test("stops when a tag or even an unpublished draft already exists", async () => {
  await assert.rejects(
    fixture({ tagStatus: 200 }).preparer.prepare("core", version),
    /Git tag already exists/u,
  );
  await assert.rejects(
    fixture({ releaseStatus: 200 }).preparer.prepare("core", version),
    /Visible GitHub Release already exists/u,
  );
  await assert.rejects(
    fixture({ checkReleaseListing: true, draft: true }).preparer.prepare(
      "core",
      version,
    ),
    /visible GitHub Release or draft already exists/u,
  );
});

test("checks the authenticated release listing without inferring user push permissions", async () => {
  const { preparer, requests } = fixture({ checkReleaseListing: true });
  const intent = await preparer.prepare("core", version);
  const publicIntent = await fixture().preparer.prepare("core", version);
  assert.equal(intent.releasePreflight, "authenticated");
  assert.equal(intent.approvalSha256, publicIntent.approvalSha256);
  assert.equal(requests.length, 7);
  assert.ok(
    requests.every(
      ({ url }) => url !== "https://api.github.com/repos/BlueLuscious/aster",
    ),
  );
  assert.equal(
    requests.find(({ url }) => url.includes("/releases?"))?.headers
      .Authorization,
    "Bearer read-only-test-token",
  );
});

test("fails closed when authenticated release listing is unavailable", async () => {
  assert.throws(
    () =>
      new PackageReleasePreparer({
        workspaceRoot: "/repository",
        git: async () => "",
        readText: async () => "",
        fetchResponse: fetch,
        githubToken: "",
        checkReleaseListing: true,
      }),
    /Authenticated release listing requires/u,
  );
  await assert.rejects(
    fixture({ releaseStatus: 403 }).preparer.prepare("core", version),
    /inspection failed: HTTP 403/u,
  );
  await assert.rejects(
    fixture({ checkReleaseListing: true, listingStatus: 403 }).preparer.prepare(
      "core",
      version,
    ),
    /request failed: HTTP 403/u,
  );
});
