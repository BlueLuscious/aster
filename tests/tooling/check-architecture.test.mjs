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

test("rejects Core production dependencies and public package boundary drift", async () => {
  const root = await createFixture();

  try {
    await writeFixtureJson(root, "packages/core/package.json", {
      name: "@aster/core",
      type: "module",
      sideEffects: true,
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
        },
        "./runtime": "./dist/runtime.js",
      },
      dependencies: {
        "host-library": "^1.0.0",
      },
    });
    await writeFixtureJson(root, "packages/core/tsconfig.json", {
      compilerOptions: {
        lib: ["ES2022", "DOM"],
        types: ["node"],
      },
    });
    await writeFixtureFile(root, "packages/core/src/index.ts", "export {};\n");

    const issues = await verifyArchitecture(root);

    assert.ok(
      issues.some((issue) => /cannot declare production dependencies/u.test(issue)),
    );
    assert.ok(issues.some((issue) => /sideEffects as false/u.test(issue)));
    assert.ok(issues.some((issue) => /expose only the root/u.test(issue)));
    assert.ok(issues.some((issue) => /cannot add host libraries/u.test(issue)));
    assert.ok(issues.some((issue) => /cannot add ambient/u.test(issue)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects host adapters and reverse dependencies in the private build domain", async () => {
  const root = await createFixture();

  try {
    await writeFixtureJson(root, "packages/build/package.json", {
      name: "@aster/build",
      private: false,
      type: "module",
      dependencies: {
        "@aster/svg": "workspace:*",
        lilium: "^1.0.0",
      },
    });
    await writeFixtureJson(root, "packages/build/tsconfig.json", {
      compilerOptions: {
        lib: ["ES2022", "DOM"],
        types: ["node"],
      },
    });
    await writeFixtureFile(
      root,
      "packages/build/src/index.ts",
      'import "node:fs";\nimport "../../../tooling/adapter.js";\n',
    );
    await writeFixtureJson(root, "packages/svg/package.json", {
      name: "@aster/svg",
      type: "module",
    });
    await writeFixtureFile(root, "packages/svg/src/index.ts", "export {};\n");

    const issues = await verifyArchitecture(root);

    assert.ok(issues.some((issue) => /must remain a private/u.test(issue)));
    assert.ok(
      issues.some((issue) => /cannot depend on workspace package @aster\/svg/u.test(issue)),
    );
    assert.ok(issues.some((issue) => /host ecosystem package lilium/u.test(issue)));
    assert.ok(issues.some((issue) => /cannot add host libraries/u.test(issue)));
    assert.ok(issues.some((issue) => /cannot add ambient/u.test(issue)));
    assert.ok(issues.some((issue) => /imports a Node adapter/u.test(issue)));
    assert.ok(issues.some((issue) => /imports repository tooling/u.test(issue)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects private parser dependency and adapter boundary drift", async () => {
  const root = await createFixture();

  try {
    await writeFixtureJson(root, "packages/build/package.json", {
      name: "@aster/build",
      private: true,
      type: "module",
      sideEffects: false,
      exports: {
        ".": {
          types: "./dist/index.d.ts",
          import: "./dist/index.js",
        },
      },
      dependencies: {
        "xmlsax-typescript": "^1.0.0",
        "another-parser": "1.0.0",
      },
    });
    await writeFixtureFile(
      root,
      "packages/build/src/source/runtime/source.ts",
      'import { tokenizeXml } from "xmlsax-typescript";\nvoid tokenizeXml;\n',
    );
    await writeFixtureFile(
      root,
      "packages/build/src/index.ts",
      [
        'export * from "./parser/runtime/svg.parser.js";',
        'export * from "./validation/runtime/svg.validator.js";',
        "",
      ].join("\n"),
    );

    const issues = await verifyArchitecture(root);

    assert.ok(
      issues.some((issue) => /unaccepted production dependency another-parser/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) => /must pin the accepted xmlsax-typescript parser/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) => /imports the XML parser outside its accepted private adapter/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) => /cannot expose its untrusted parser feature/u.test(issue)),
    );
    assert.ok(
      issues.some((issue) => /cannot expose its internal validation feature/u.test(issue)),
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
