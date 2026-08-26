import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { ExportOutputPublisher } from "../../dist/shell/runtime/export-output.publisher.js";
import { ExportOutputPathResolver } from "../../dist/shell/runtime/export-output-path.resolver.js";
import { NodeExportOutputFileSystem } from "../../dist/shell/runtime/node-export-output-file-system.js";

const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

function plan(paths) {
  return Object.freeze({
    target: "svg",
    subject: "collection",
    catalogue: "fixture",
    identity: "fixture",
    artefacts: Object.freeze(paths.map((path) => Object.freeze({
      path,
      mediaType: "image/svg+xml",
      content: svg,
    }))),
  });
}

class FixtureFileSystem {
  entries = new Set();
  operations = [];
  failure;
  cleanupFailure = false;

  constructor(failure) {
    this.failure = failure;
  }

  async exists(path) {
    this.operations.push(["exists", path]);
    this.#fail("exists");
    return this.entries.has(path);
  }

  async ensureDirectory(path) {
    this.operations.push(["ensureDirectory", path]);
    this.#fail("ensureDirectory");
    this.entries.add(path);
  }

  async createDirectory(path) {
    this.operations.push(["createDirectory", path]);
    this.#fail("createDirectory");
    this.entries.add(path);
  }

  async writeText(path) {
    this.operations.push(["writeText", path]);
    this.#fail("writeText");
    this.entries.add(path);
  }

  async renameDirectory(source, destination) {
    this.operations.push(["renameDirectory", source, destination]);
    this.#fail("renameDirectory");
    this.entries.delete(source);
    this.entries.add(destination);
  }

  async removeDirectory(path) {
    this.operations.push(["removeDirectory", path]);

    if (this.cleanupFailure) {
      throw new Error("fixture cleanup failure");
    }

    for (const entry of this.entries) {
      if (entry === path || entry.startsWith(`${path}\\`) || entry.startsWith(`${path}/`)) {
        this.entries.delete(entry);
      }
    }
  }

  #fail(operation) {
    if (this.failure === operation) {
      throw new Error(`fixture ${operation} failure`);
    }
  }
}

class AppearingTargetFileSystem extends FixtureFileSystem {
  targetChecks = 0;

  async exists(path) {
    this.operations.push(["exists", path]);

    if (path.endsWith("output")) {
      this.targetChecks += 1;
      return this.targetChecks > 1;
    }

    return false;
  }
}

function fixturePublisher(fileSystem) {
  return new ExportOutputPublisher(
    fileSystem,
    new ExportOutputPathResolver(),
  );
}

async function temporaryDirectory() {
  return mkdtemp(join(tmpdir(), "aster-cli-output-"));
}

test("publishes complete nested trees beside absent targets deterministically", async () => {
  const root = await temporaryDirectory();

  try {
    const publisher = fixturePublisher(new NodeExportOutputFileSystem());
    const exportPlan = plan(["aster/camera.svg", "aster/ui/close.svg"]);
    const first = await publisher.publish(exportPlan, root, "nested/first");
    const second = await publisher.publish(exportPlan, root, "nested/second");

    assert.deepEqual(first, {
      targetRoot: resolve(root, "nested/first"),
      artefactCount: 2,
      committed: true,
    });
    assert.equal(
      await readFile(resolve(root, "nested/first/aster/camera.svg"), "utf8"),
      svg,
    );
    assert.equal(
      await readFile(resolve(root, "nested/first/aster/ui/close.svg"), "utf8"),
      svg,
    );
    assert.equal(
      await readFile(resolve(root, "nested/second/aster/camera.svg"), "utf8"),
      svg,
    );
    assert.equal(first.artefactCount, second.artefactCount);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects existing targets and interrupted stages without removing them", async () => {
  const root = await temporaryDirectory();

  try {
    const publisher = fixturePublisher(new NodeExportOutputFileSystem());
    const target = resolve(root, "existing");
    const stage = resolve(root, ".interrupted.aster-stage");
    await mkdir(target);
    await writeFile(resolve(target, "marker.txt"), "retained", "utf8");
    await mkdir(stage);
    await writeFile(resolve(stage, "marker.txt"), "retained", "utf8");

    await assert.rejects(
      publisher.publish(plan(["icon.svg"]), root, "existing"),
      (error) => error?.kind === "conflict" && error?.message === "output root already exists",
    );
    await assert.rejects(
      publisher.publish(plan(["icon.svg"]), root, "interrupted"),
      (error) => error?.kind === "conflict" && error?.message === "private output stage already exists",
    );
    assert.equal(await readFile(resolve(target, "marker.txt"), "utf8"), "retained");
    assert.equal(await readFile(resolve(stage, "marker.txt"), "utf8"), "retained");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("performs no filesystem operation for empty plans", async () => {
  const fileSystem = new FixtureFileSystem();
  const publication = await fixturePublisher(fileSystem).publish(
    plan([]),
    "/explicit/current-directory",
    "unused-output",
  );

  assert.equal(publication.artefactCount, 0);
  assert.equal(publication.committed, false);
  assert.deepEqual(fileSystem.operations, []);
});

test("rejects unsafe, ambiguous, and duplicate logical paths before mutation", async () => {
  const unsafePaths = [
    "../escape.svg",
    "namespace/../escape.svg",
    "namespace/./icon.svg",
    "/absolute.svg",
    "namespace\\icon.svg",
    "namespace//icon.svg",
    "namespace/C:icon.svg",
    "namespace/con.svg",
    "namespace/icon.svg.",
  ];

  for (const path of unsafePaths) {
    const fileSystem = new FixtureFileSystem();
    await assert.rejects(
      fixturePublisher(fileSystem).publish(
        plan([path]),
        "/explicit/current-directory",
        "output",
      ),
      (error) => error?.kind === "conflict",
    );
    assert.deepEqual(fileSystem.operations, []);
  }

  const duplicateFileSystem = new FixtureFileSystem();
  await assert.rejects(
    fixturePublisher(duplicateFileSystem).publish(
      plan(["icon.svg", "icon.svg"]),
      "/explicit/current-directory",
      "output",
    ),
    (error) => error?.kind === "conflict",
  );
  assert.deepEqual(duplicateFileSystem.operations, []);
});

test("rejects relative current-directory authority before path resolution", async () => {
  const fileSystem = new FixtureFileSystem();

  await assert.rejects(
    fixturePublisher(fileSystem).publish(
      plan(["icon.svg"]),
      "relative-current-directory",
      "output",
    ),
    (error) => error?.kind === "conflict",
  );
  assert.deepEqual(fileSystem.operations, []);
});

test("sanitises inaccessible and staging failures without claiming an unowned stage", async () => {
  for (const operation of ["exists", "ensureDirectory", "createDirectory"]) {
    const fileSystem = new FixtureFileSystem(operation);
    await assert.rejects(
      fixturePublisher(fileSystem).publish(
        plan(["icon.svg"]),
        "/explicit/current-directory",
        "output",
      ),
      (error) =>
        error?.kind === "failure"
        && error?.message === "output publication failed",
    );
    assert.equal(
      fileSystem.operations.some(([name]) => name === "removeDirectory"),
      false,
    );
  }
});

test("removes only its current stage after write and rename failures", async () => {
  for (const operation of ["writeText", "renameDirectory"]) {
    const fileSystem = new FixtureFileSystem(operation);
    await assert.rejects(
      fixturePublisher(fileSystem).publish(
        plan(["namespace/icon.svg"]),
        "/explicit/current-directory",
        "output",
      ),
      (error) => error?.kind === "failure",
    );

    const removals = fileSystem.operations.filter(([name]) => name === "removeDirectory");
    assert.equal(removals.length, 1);
    assert.match(removals[0]?.[1] ?? "", /\.output\.aster-stage$/u);
  }
});

test("removes its stage when the target appears before publication", async () => {
  const fileSystem = new AppearingTargetFileSystem();

  await assert.rejects(
    fixturePublisher(fileSystem).publish(
      plan(["namespace/icon.svg"]),
      "/explicit/current-directory",
      "output",
    ),
    (error) =>
      error?.kind === "conflict"
      && error?.message === "output root appeared before publication",
  );

  assert.equal(
    fileSystem.operations.some(([name]) => name === "renameDirectory"),
    false,
  );
  assert.equal(
    fileSystem.operations.filter(([name]) => name === "removeDirectory").length,
    1,
  );
});

test("reports cleanup failures without exposing native failure text", async () => {
  const fileSystem = new FixtureFileSystem("writeText");
  fileSystem.cleanupFailure = true;

  await assert.rejects(
    fixturePublisher(fileSystem).publish(
      plan(["icon.svg"]),
      "/explicit/current-directory",
      "output",
    ),
    (error) =>
      error?.kind === "failure"
      && error?.message === "output publication failed"
      && !error.message.includes("fixture"),
  );
});
