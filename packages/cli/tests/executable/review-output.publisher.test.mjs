import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { reviewDocumentSchema } from "../../dist/review/constants/review-document-schema.constant.js";
import { NodeOutputFileSystem } from "../../dist/shell/output/runtime/node-output-file-system.js";
import { OutputLocationResolver } from "../../dist/shell/output/runtime/output-location.resolver.js";
import { ReviewOutputPathResolver } from "../../dist/shell/output/runtime/review-output-path.resolver.js";
import { ReviewOutputPublisher } from "../../dist/shell/output/runtime/review-output.publisher.js";

class FailingWriteFileSystem extends NodeOutputFileSystem {
  async writeText() {
    throw new Error("fixture write failure");
  }
}

class FailingCommitFileSystem extends NodeOutputFileSystem {
  failed = false;

  async renameDirectory(source, destination) {
    if (!this.failed && source.endsWith(".aster-stage")) {
      this.failed = true;
      throw new Error("fixture commit failure");
    }

    await super.renameDirectory(source, destination);
  }
}

function content(label) {
  return `<!doctype html>\n${reviewDocumentSchema.ownershipMarker}\n${label}\n`;
}

function publisher(fileSystem, label) {
  return new ReviewOutputPublisher(
    fileSystem,
    new ReviewOutputPathResolver(new OutputLocationResolver()),
    { serialise: () => content(label) },
  );
}

async function temporaryDirectory() {
  return mkdtemp(join(tmpdir(), "aster-cli-review-output-"));
}

test("publishes one complete self-contained document beneath an absent root", async () => {
  const root = await temporaryDirectory();

  try {
    const publication = await publisher(
      new NodeOutputFileSystem(),
      "first",
    ).publish({}, root, "review", false);

    assert.deepEqual(publication, {
      targetRoot: resolve(root, "review"),
      replaced: false,
    });
    assert.equal(
      await readFile(resolve(root, "review/index.html"), "utf8"),
      content("first"),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects existing output unless exact ownership and replacement are explicit", async () => {
  const root = await temporaryDirectory();

  try {
    const target = resolve(root, "review");
    await mkdir(target);
    await writeFile(resolve(target, "index.html"), "unrelated", "utf8");
    const output = publisher(new NodeOutputFileSystem(), "new");

    await assert.rejects(
      output.publish({}, root, "review", false),
      (error) => error?.kind === "conflict"
        && error?.message === "output root already exists",
    );
    await assert.rejects(
      output.publish({}, root, "review", true),
      (error) => error?.kind === "conflict"
        && error?.message === "existing output is not an owned Aster review",
    );
    assert.equal(await readFile(resolve(target, "index.html"), "utf8"), "unrelated");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("preserves interrupted private backup evidence before publication", async () => {
  const root = await temporaryDirectory();

  try {
    const backup = resolve(root, ".review.aster-review-backup");
    await mkdir(backup);
    await writeFile(resolve(backup, "index.html"), content("previous"), "utf8");

    await assert.rejects(
      publisher(new NodeOutputFileSystem(), "new").publish(
        {},
        root,
        "review",
        false,
      ),
      (error) => error?.kind === "conflict"
        && error?.message === "private output backup already exists",
    );
    assert.equal(
      await readFile(resolve(backup, "index.html"), "utf8"),
      content("previous"),
    );
    await assert.rejects(readFile(resolve(root, "review")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("replaces only an unchanged owned review through a complete staged document", async () => {
  const root = await temporaryDirectory();

  try {
    await publisher(new NodeOutputFileSystem(), "first").publish(
      {},
      root,
      "review",
      false,
    );
    const publication = await publisher(
      new NodeOutputFileSystem(),
      "second",
    ).publish({}, root, "review", true);

    assert.deepEqual(publication, {
      targetRoot: resolve(root, "review"),
      replaced: true,
    });
    assert.equal(
      await readFile(resolve(root, "review/index.html"), "utf8"),
      content("second"),
    );
    await assert.rejects(
      readFile(resolve(root, ".review.aster-review-backup")),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("removes failed stages and restores an owned review after commit failure", async () => {
  const root = await temporaryDirectory();

  try {
    await publisher(new NodeOutputFileSystem(), "first").publish(
      {},
      root,
      "review",
      false,
    );
    await assert.rejects(
      publisher(new FailingCommitFileSystem(), "second").publish(
        {},
        root,
        "review",
        true,
      ),
      (error) => error?.kind === "failure"
        && error?.message === "output publication failed",
    );
    assert.equal(
      await readFile(resolve(root, "review/index.html"), "utf8"),
      content("first"),
    );
    await assert.rejects(readFile(resolve(root, ".review.aster-stage")));
    await assert.rejects(
      readFile(resolve(root, ".review.aster-review-backup")),
    );

    await assert.rejects(
      publisher(new FailingWriteFileSystem(), "third").publish(
        {},
        root,
        "new-review",
        false,
      ),
      (error) => error?.kind === "failure",
    );
    await assert.rejects(readFile(resolve(root, "new-review")));
    await assert.rejects(readFile(resolve(root, ".new-review.aster-stage")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
