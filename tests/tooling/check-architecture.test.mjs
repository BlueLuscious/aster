import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { verifyArchitecture } from "../../tooling/architecture/check-architecture.mjs";

async function writeFixtureFile(root, path, content) {
  const target = resolve(root, path);

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
}

async function writeFixtureJson(root, path, value) {
  await writeFixtureFile(root, path, `${JSON.stringify(value, null, 2)}\n`);
}

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-architecture-"));

  await writeFixtureJson(root, "package.json", {
    name: "aster-fixture",
    private: true,
    type: "module",
    workspaces: ["packages/*"],
  });
  await writeFixtureFile(root, "pnpm-workspace.yaml", "packages:\n  - packages/*\n");
  await writeFixtureJson(root, "tsconfig.base.json", {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022"],
      module: "ESNext",
      moduleResolution: "Bundler",
      types: [],
      verbatimModuleSyntax: true,
    },
  });

  return root;
}

test("accepts a host-independent workspace fixture", async () => {
  const root = await createFixture();

  try {
    const issues = await verifyArchitecture(root);

    assert.deepEqual(issues, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects host libraries in the portable compiler baseline", async () => {
  const root = await createFixture();

  try {
    await writeFixtureJson(root, "tsconfig.base.json", {
      compilerOptions: {
        target: "ES2022",
        lib: ["ES2022", "DOM"],
        module: "ESNext",
        moduleResolution: "Bundler",
        types: [],
        verbatimModuleSyntax: true,
      },
    });

    const issues = await verifyArchitecture(root);

    assert.ok(
      issues.some((issue) => /compilerOptions\.lib must be \["ES2022"\]/u.test(issue)),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects reverse and relative package dependencies", async () => {
  const root = await createFixture();

  try {
    await writeFixtureJson(root, "packages/core/package.json", {
      name: "@aster/core",
      type: "module",
      dependencies: {
        "@aster/svg": "workspace:*",
      },
    });
    await writeFixtureFile(
      root,
      "packages/core/src/index.ts",
      'import "../../svg/src/index.js";\n',
    );
    await writeFixtureJson(root, "packages/svg/package.json", {
      name: "@aster/svg",
      type: "module",
    });
    await writeFixtureFile(root, "packages/svg/src/index.ts", "export {};\n");

    const issues = await verifyArchitecture(root);

    assert.ok(
      issues.some((issue) =>
        /@aster\/core cannot depend on another workspace package/u.test(issue),
      ),
    );
    assert.ok(
      issues.some((issue) => /imports another package through a relative path/u.test(issue)),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects invalid authored collection boundaries", async () => {
  const root = await createFixture();

  try {
    await mkdir(resolve(root, "collections/Bad_Name/masters"), { recursive: true });
    await mkdir(resolve(root, "collections/Bad_Name/svg"), { recursive: true });
    await mkdir(resolve(root, "collections/Bad_Name/generated"), { recursive: true });

    const issues = await verifyArchitecture(root);

    assert.ok(
      issues.some((issue) => /must use a canonical kebab-case slug/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) => /is missing authored metadata\/ source/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) =>
        /generated\/ cannot be inside an authored collection/u.test(issue),
      ),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
