import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile, lstat, unlink, link, symlink } from "node:fs/promises";
import * as nodeFileSystem from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { CatalogueIconRemovalCommand } from "../../tooling/catalogue/runtime/catalogue-icon-removal.command.mjs";
import { CatalogueIconRemovalPlanner } from "../../tooling/catalogue/runtime/catalogue-icon-removal.planner.mjs";
import { CatalogueIconRemovalSource } from "../../tooling/catalogue/runtime/catalogue-icon-removal-source.mjs";
import { CatalogueIconRemovalApplicator } from "../../tooling/catalogue/runtime/catalogue-icon-removal.applicator.mjs";
import { CatalogueIconRemovalSession } from "../../tooling/catalogue/runtime/catalogue-icon-removal-session.mjs";
import { NodeCatalogueIconRemovalBuild } from "../../tooling/catalogue/runtime/node-catalogue-icon-removal-build.mjs";
import { synchroniseIconsCatalogue } from "../../tooling/catalogue/synchronise-icons-catalogue.mjs";

const collectionPath = "packages/icons/src/collections/s/sample/sample.collection.ts";
const alphaOutline = "packages/icons/src/glyphs/a/alpha-icon/alpha-icon-outline.icon.ts";
const alphaFilled = "packages/icons/src/glyphs/a/alpha-icon/alpha-icon-filled.icon.ts";
const betaOutline = "packages/icons/src/glyphs/b/beta/beta-outline.icon.ts";

async function write(root, path, text) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");
}

function icon(name, variant, symbol) {
  return `import { Icon } from "@luscious-garden/aster-core";
export const ${symbol} = Icon.define({
  identity: { namespace: "fixture", name: "${name}", variant: "${variant}" },
  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
  metadata: { displayName: "${symbol}", tags: ["fixture"], rtl: "preserve", deprecated: false },
});\n`;
}

function collection(name = "sample", symbol = "Sample") {
  return `import { Collection } from "@luscious-garden/aster-core";
import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";
import { AlphaIconFilled } from "../../../glyphs/a/alpha-icon/alpha-icon-filled.icon.js";

/** @description Retained collection documentation. */
export const ${symbol} = Collection.define({
  identity: { name: "${name}" },
  icons: {
    alphaIcon: { outline: AlphaIconOutline, filled: AlphaIconFilled },
  },
  metadata: { displayName: "Retain me", description: "Untouched metadata." },
});\n`;
}

async function fixture(t) {
  const parent = await realpath(tmpdir());
  const root = await realpath(await mkdtemp(join(parent, "aster-removal-planning-")));
  await writeFile(join(root, ".owner"), "catalogue-icon-removal-test");
  t.after(async () => {
    assert.equal(dirname(root), parent);
    assert.equal((await lstat(root)).isSymbolicLink(), false);
    assert.equal(await readFile(join(root, ".owner"), "utf8"), "catalogue-icon-removal-test");
    const clearLinks = async (directory) => {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isSymbolicLink()) {
          await unlink(path);
        } else if (entry.isDirectory()) {
          await clearLinks(path);
        }
      }
    };
    await clearLinks(root);
    await rm(root, { recursive: true, force: false });
  });
  await write(root, alphaOutline, icon("alpha-icon", "outline", "AlphaIconOutline"));
  await write(root, alphaFilled, icon("alpha-icon", "filled", "AlphaIconFilled"));
  await write(root, betaOutline, icon("beta", "outline", "BetaOutline"));
  await write(root, collectionPath, collection());
  await write(root, "packages/icons/package.json", JSON.stringify({ private: true, type: "module", exports: {} }, null, 2) + "\n");
  await write(root, "tsconfig.base.json", "{}\n");
  await write(root, "packages/icons/tsconfig.json", "{}\n");
  const regenerate = () => synchroniseIconsCatalogue(join(root, "packages/icons"));
  await regenerate();
  return { root, regenerate, planner: new CatalogueIconRemovalPlanner(root) };
}

async function fingerprintTree(root) {
  const result = {};
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
      } else if (entry.isFile()) {
        const status = await lstat(path);
        result[path] = { hash: createHash("sha256").update(await readFile(path)).digest("hex"), mtime: status.mtimeMs };
      }
    }
  };
  await walk(root);
  return result;
}

function frozen(value) {
  if (value !== null && typeof value === "object") {
    assert.equal(Object.isFrozen(value), true);
    Object.values(value).forEach(frozen);
  }
}

// This build double exercises the real producer; a separate integration compiles real modules.
function applicationBuild(root, regenerate) {
  return {
    async prepare() {},
    async run() {
      await regenerate();
      const session = new CatalogueIconRemovalSession(root);
      await session.guardTree("packages/icons/dist");
      await rm(join(root, "packages/icons/dist"), { recursive: true, force: true });
      const emit = async (directory) => {
        for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
          const path = `${directory}/${entry.name}`;
          if (entry.isDirectory()) {
            await emit(path);
          } else if (entry.name.endsWith(".ts")) {
            for (const extension of [".js", ".d.ts"]) {
              await write(root, path.replace("packages/icons/src/", "packages/icons/dist/").replace(/\.ts$/u, extension), "export {};\n");
            }
          }
        }
      };
      await emit("packages/icons/src");
    },
  };
}

async function recoveryEntries(root) {
  return (await readdir(join(root, "packages/icons"))).filter((name) => name.startsWith(".aster-icon-removal"));
}

function application(root, regenerate, effects = nodeFileSystem) {
  return new CatalogueIconRemovalApplicator(root, applicationBuild(root, regenerate), () => new CatalogueIconRemovalSession(root, effects));
}

test("previews exact collection edits and generated postimages without any file/content/mtime change", async (t) => {
  const { root, planner } = await fixture(t);
  const before = await fingerprintTree(root);
  const plan = await planner.plan("fixture/alpha-icon@filled");
  assert.equal(plan.removalPath, alphaFilled);
  assert.match(plan.fingerprint, /^[a-f0-9]{64}$/u);
  assert.equal(plan.edits.length, 1);
  const edit = plan.edits[0];
  assert.equal(edit.path, collectionPath);
  assert.equal(edit.before, collection());
  assert.equal(edit.after, collection().replace(/^import \{ AlphaIconFilled \}[^\n]*\n/mu, "").replace(", filled: AlphaIconFilled", ""));
  assert.deepEqual(edit.aliases, ["alphaIcon"]);
  assert.equal(edit.empty, false);
  assert.equal(plan.outputs.find((output) => output.path.endsWith("icons/alpha-icon/filled.ts")).content, undefined);
  const exports = plan.outputs.find((output) => output.path === "packages/icons/package.json");
  assert.equal(Object.hasOwn(JSON.parse(exports.content).exports, "./*/filled"), false);
  assert.match(plan.outputs.find((output) => output.path.endsWith("glyphs/alpha-icon.ts")).content, /AlphaIconOutline/u);
  frozen(plan);
  assert.deepEqual(await planner.plan("fixture/alpha-icon@filled"), plan);
  assert.deepEqual(await fingerprintTree(root), before);
});

test("plans an independent final glyph treatment without inventing collection changes", async (t) => {
  const { planner } = await fixture(t);
  const plan = await planner.plan("fixture/beta@outline");
  assert.deepEqual(plan.edits, []);
  assert.equal(plan.outputs.find((output) => output.path.endsWith("glyphs/beta.ts")).content, undefined);
  assert.equal(plan.generatedPaths.includes("packages/icons/package.json"), false);
});

test("finds memberships across every collection and retains their distinct aliases/metadata", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  const second = "packages/icons/src/collections/s/second/second.collection.ts";
  await write(root, second, collection("second", "Second").replace("alphaIcon:", "secondAlias:"));
  await regenerate();
  const plan = await planner.plan("fixture/alpha-icon@filled");
  assert.equal(plan.edits.length, 2);
  assert.deepEqual(plan.edits.map((edit) => edit.aliases), [["alphaIcon"], ["secondAlias"]]);
  for (const edit of plan.edits) {
    assert.match(edit.after, /description: "Untouched metadata\."/u);
    assert.match(edit.after, /Retained collection documentation/u);
  }
});

test("removes an empty alias but preserves the last-member collection declaration", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  const only = collection().replace(/^import \{ AlphaIconOutline \}[^\n]*\n/mu, "").replace("outline: AlphaIconOutline, ", "");
  await write(root, collectionPath, only);
  await regenerate();
  const plan = await planner.plan("fixture/alpha-icon@filled");
  assert.equal(plan.edits[0].empty, true);
  assert.doesNotMatch(plan.edits[0].after, /alphaIcon:|AlphaIconFilled/u);
  assert.match(plan.edits[0].after, /export const Sample = Collection.define/u);
  assert.match(plan.edits[0].after, /displayName: "Retain me"/u);
});

test("preserves BOM, CRLF, single quotes, aliases, multiline imports and literal treatment keys", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  let text = collection().replace("import { AlphaIconFilled }", "import {\n  AlphaIconFilled as ChosenFill,\n}");
  text = text.replace("filled: AlphaIconFilled", "'filled': ChosenFill").replaceAll('"', "'");
  text = "\uFEFF" + text.replaceAll("\n", "\r\n");
  await write(root, collectionPath, text);
  await regenerate();
  const plan = await planner.plan("fixture/alpha-icon@filled");
  const after = plan.edits[0].after;
  assert.equal(after.startsWith("\uFEFF"), true);
  assert.equal(after.replaceAll("\r\n", "").includes("\n"), false);
  assert.match(after, /outline: AlphaIconOutline/u);
  assert.doesNotMatch(after, /ChosenFill|AlphaIconFilled/u);
  assert.match(after, /description: 'Untouched metadata\.'/u);
});

test("handles integer-string treatment keys without changing retained membership order", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await write(root, "packages/icons/src/glyphs/a/alpha-icon/alpha-icon-2.icon.ts", icon("alpha-icon", "2", "AlphaIcon2"));
  const text = collection().replace("import { AlphaIconFilled }", 'import { AlphaIcon2 } from "../../../glyphs/a/alpha-icon/alpha-icon-2.icon.js";\nimport { AlphaIconFilled }')
    .replace("outline: AlphaIconOutline,", '"2": AlphaIcon2, outline: AlphaIconOutline,');
  await write(root, collectionPath, text);
  await regenerate();
  const plan = await planner.plan("fixture/alpha-icon@2");
  assert.match(plan.edits[0].after, /alphaIcon: \{ outline: AlphaIconOutline, filled: AlphaIconFilled \}/u);
});

test("fingerprints change for exact source preimages and review notices, not checkout location", async (t) => {
  const first = await fixture(t);
  const second = await fixture(t);
  const before = await first.planner.plan("fixture/alpha-icon@filled");
  assert.equal((await second.planner.plan("fixture/alpha-icon@filled")).fingerprint, before.fingerprint);
  const original = await readFile(join(first.root, alphaFilled), "utf8");
  await write(first.root, alphaFilled, original.replace("radius: 4", "radius: 5"));
  const geometryChange = await first.planner.plan("fixture/alpha-icon@filled");
  assert.notEqual(geometryChange.fingerprint, before.fingerprint);
  await write(first.root, "docs/example.md", "Use AlphaIconFilled for this example.\n");
  const reviewed = await first.planner.plan("fixture/alpha-icon@filled");
  assert.deepEqual(reviewed.references, [{ path: "docs/example.md", lines: [1] }]);
  assert.notEqual(reviewed.fingerprint, geometryChange.fingerprint);
});

test("never evaluates authored module statements while planning", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await write(root, alphaFilled, 'throw new Error("MUST NOT EXECUTE");\n' + icon("alpha-icon", "filled", "AlphaIconFilled"));
  await regenerate();
  assert.equal((await planner.plan("fixture/alpha-icon@filled")).removalPath, alphaFilled);
});

test("rejects incomplete, path-like, fuzzy and non-canonical selectors without changing files", async (t) => {
  const { root, planner } = await fixture(t);
  const before = await fingerprintTree(root);
  for (const selector of ["alpha-icon", "fixture/alpha-icon", "fixture/alpha-icon@", "fixture/alpha-icon@*", "../alpha-icon@outline", "fixture/Alpha-icon@outline", " fixture/alpha-icon@outline", "fixture/alpha-icon@outline@filled", "a/b/c@outline"]) {
    await assert.rejects(planner.plan(selector), /exact.*identity/u);
  }
  for (const selector of ["alpha-icon@outline", "other/alpha-icon@outline", "fixture/absent@outline"]) {
    await assert.rejects(planner.plan(selector), /not found/u);
  }
  assert.deepEqual(await fingerprintTree(root), before);
});

test("rejects bindings used outside membership and unrelated import bindings from the deleted module", async (t) => {
  for (const extra of ["const retained = AlphaIconFilled;\n", "export type Retained = typeof AlphaIconFilled;\n"]) {
    await t.test(extra, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      await write(root, collectionPath, collection() + extra);
      await regenerate();
      const before = await fingerprintTree(root);
      await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /outside removable memberships/u);
      assert.deepEqual(await fingerprintTree(root), before);
    });
  }
  const { root, regenerate, planner } = await fixture(t);
  await write(root, alphaFilled, icon("alpha-icon", "filled", "AlphaIconFilled") + "export type Retained = string;\n");
  await write(root, collectionPath, collection().replace("{ AlphaIconFilled }", "{ AlphaIconFilled, type Retained }") + "export type Metadata = Retained;\n");
  await regenerate();
  const before = await fingerprintTree(root);
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /Other import bindings/u);
  assert.deepEqual(await fingerprintTree(root), before);
});

test("rejects static, dynamic-literal and type dependencies in other authored Icons modules", async (t) => {
  for (const expression of [
    'export { AlphaIconFilled } from "../glyphs/a/alpha-icon/alpha-icon-filled.icon.js";',
    'export type Value = typeof import("../glyphs/a/alpha-icon/alpha-icon-filled.icon.js");',
    'const value = import("../glyphs/a/alpha-icon/alpha-icon-filled.icon.js");',
    'import type { AlphaIconFilled } from "@luscious-garden/aster-icons/alpha-icon/filled";',
  ]) {
    await t.test(expression, async (t) => {
      const { root, planner } = await fixture(t);
      await write(root, "packages/icons/src/authoring/dependent.constant.ts", expression + "\n");
      const before = await fingerprintTree(root);
      await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /outside supported membership/u);
      assert.deepEqual(await fingerprintTree(root), before);
    });
  }
});

test("rejects ambiguous selected comments rather than deleting curatorial information", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await write(root, collectionPath, collection().replace("filled: AlphaIconFilled", "/** Keep this note. */ filled: AlphaIconFilled"));
  await regenerate();
  const before = await fingerprintTree(root);
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /comment ownership/u);
  assert.deepEqual(await fingerprintTree(root), before);
});

test("refuses existing drift, missing files and unrelated invalid syntax instead of repairing sources", async (t) => {
  for (const fault of ["generated", "dangling", "independent-missing", "unsupported-membership", "unrelated-syntax"]) {
    await t.test(fault, async (t) => {
      const { root, planner } = await fixture(t);
      if (fault === "generated") {
        await write(root, "packages/icons/src/generated/manifest/index.ts", "stale\n");
      } else if (fault === "dangling") {
        await unlink(join(root, alphaFilled));
      } else if (fault === "independent-missing") {
        await unlink(join(root, betaOutline));
      } else if (fault === "unsupported-membership") {
        await write(root, collectionPath, collection().replace("filled: AlphaIconFilled", "...AlphaIconFilled"));
      } else {
        await write(root, betaOutline, "export const = ;\n");
      }
      const before = await fingerprintTree(root);
      await assert.rejects(planner.plan("fixture/alpha-icon@filled"));
      assert.deepEqual(await fingerprintTree(root), before);
    });
  }
});

test("preserves strict rejection of removing the final canonical icon", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await unlink(join(root, alphaOutline));
  await unlink(join(root, alphaFilled));
  await write(root, collectionPath, 'import { Collection } from "@luscious-garden/aster-core";\nexport const Sample = Collection.define({identity:{name:"sample"},icons:{},metadata:{displayName:"Empty"}});\n');
  await regenerate();
  await assert.rejects(planner.plan("fixture/beta@outline"), /cannot empty/u);
});

test("rejects interrupted operation markers and invalid UTF-8 before issuing a proposal", async (t) => {
  const { root, planner } = await fixture(t);
  const marker = join(root, "packages/icons/.aster-icon-removal.lock");
  await writeFile(marker, "retained recovery evidence");
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /interrupted/u);
  assert.equal(await readFile(marker, "utf8"), "retained recovery evidence");
  await unlink(marker);
  await writeFile(join(root, alphaFilled), Buffer.from([0xff, 0x00]));
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /valid UTF-8/u);
});

test("rejects source hard links and junctions without following or removing their targets", async (t) => {
  const { root, planner } = await fixture(t);
  const copied = join(root, "shared-icon.ts");
  await link(join(root, alphaFilled), copied);
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /linked or non-regular/u);
  assert.equal(await readFile(copied, "utf8"), icon("alpha-icon", "filled", "AlphaIconFilled"));
  await unlink(copied);
  const target = join(root, "outside-target");
  await mkdir(target);
  await writeFile(join(target, "retain.txt"), "protected");
  const junction = join(root, "packages/icons/src/glyphs/linked");
  await symlink(target, junction, process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(planner.plan("fixture/alpha-icon@filled"), /Linked or unsupported/u);
  assert.equal(await readFile(join(target, "retain.txt"), "utf8"), "protected");
});

test("read-only source capabilities refuse every write and paths outside their physical root", async (t) => {
  const { root } = await fixture(t);
  const source = new CatalogueIconRemovalSource(root);
  const view = source.view();
  const before = await fingerprintTree(root);
  await assert.rejects(view.writeText(join(root, alphaFilled), "changed"), /cannot write/u);
  await assert.rejects(view.replaceText(join(root, alphaFilled), "", ""), /cannot write/u);
  await assert.rejects(view.replaceDirectory(join(root, "packages/icons/src"), []), /cannot write/u);
  await assert.rejects(view.readText(resolve(root, "../outside.ts")), /escapes/u);
  assert.deepEqual(await fingerprintTree(root), before);
});

test("detects changed exact preimages, directory inventories and absent inputs before returning stale state", async (t) => {
  const { root } = await fixture(t);
  const source = new CatalogueIconRemovalSource(root);
  await source.view().readText(join(root, alphaFilled));
  await write(root, alphaFilled, icon("alpha-icon", "filled", "AlphaIconFilled") + "\n");
  await assert.rejects(source.verify(), /Input changed/u);
  const directory = new CatalogueIconRemovalSource(root);
  await directory.view().entries(join(root, "packages/icons/src"));
  await write(root, "packages/icons/src/extra.ts", "export {};\n");
  await assert.rejects(directory.verify(), /Directory changed/u);
  const absent = new CatalogueIconRemovalSource(root);
  assert.equal(await absent.view().exists(join(root, "new.ts")), false);
  await write(root, "new.ts", "export {};\n");
  await assert.rejects(absent.verify(), /appeared/u);
});

test("formats every preview effect and notice while refusing application or unknown arguments without planning", async (t) => {
  const { root, planner } = await fixture(t);
  await write(root, "docs/consumer.md", "Use AlphaIconFilled.\n");
  const plan = await planner.plan("fixture/alpha-icon@filled");
  const stdout = [];
  const stderr = [];
  const host = { argv: ["node", "preview", plan.identity], stdout: { write: (text) => stdout.push(text) }, stderr: { write: (text) => stderr.push(text) } };
  await new CatalogueIconRemovalCommand({ plan: async () => plan }, host).run();
  assert.deepEqual(stderr, []);
  const output = stdout.join("");
  for (const text of [plan.fingerprint, alphaFilled, collectionPath, "docs/consumer.md:1", "@@ UTF-16", "Generated/export changes:", "Apply exactly this proposal:"]) {
    assert.equal(output.includes(text), true, text);
  }
  for (const arguments_ of [[], [plan.identity, "extra"], ["--force"], [plan.identity, "--apply", plan.fingerprint]]) {
    let called = false;
    const rejected = { argv: ["node", "preview", ...arguments_], stdout: { write() { assert.fail("Unexpected stdout"); } }, stderr: { write() {} }, exitCode: 0 };
    await new CatalogueIconRemovalCommand({ plan: async () => { called = true; return plan; } }, rejected).run();
    assert.equal(called, false);
    assert.equal(rejected.exitCode, 1);
  }
});

test("the actual private entrypoint refuses a nonexistent exact identity before any removal work", () => {
  const result = spawnSync(process.execPath, [resolve("tooling/catalogue/remove-icon.mjs"), "fixture/alpha-icon@filled", "--apply", "0".repeat(64)], { encoding: "utf8" });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /not found for removal/u);
});

test("virtual absence and replacements never become physical input state", async (t) => {
  const { root } = await fixture(t);
  const snapshot = new CatalogueIconRemovalSource(root);
  const before = await snapshot.view().readText(join(root, alphaFilled));
  const original = await snapshot.view().readText(join(root, collectionPath));
  const view = snapshot.view([{ path: collectionPath, after: "virtual text" }], alphaFilled);
  assert.equal(await view.exists(join(root, alphaFilled)), false);
  assert.equal(await view.readTextIfPresent(join(root, alphaFilled)), undefined);
  assert.equal(await view.readText(join(root, collectionPath)), "virtual text");
  await snapshot.verify();
  assert.equal(snapshot.absentPaths().includes(alphaFilled), false);
  assert.equal(await readFile(join(root, alphaFilled), "utf8"), before);
  assert.equal(await readFile(join(root, collectionPath), "utf8"), original);
});

test("selects an explicitly anonymous identity without treating it as the namespaced icon", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await write(root, betaOutline, icon("beta", "outline", "BetaOutline").replace('namespace: "fixture", ', ""));
  await regenerate();
  assert.equal((await planner.plan("beta@outline")).removalPath, betaOutline);
  await assert.rejects(planner.plan("fixture/beta@outline"), /not found/u);
});

test("applies exact multi-collection edits and cleans recovery evidence only after output verification", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  await write(root, "packages/icons/src/collections/s/second/second.collection.ts", collection("second", "Second"));
  await write(root, "docs/review.md", "Keep AlphaIconFilled as historical evidence.\n");
  await regenerate();
  await applicationBuild(root, regenerate).run();
  const before = await fingerprintTree(root);
  const plan = await planner.plan("fixture/alpha-icon@filled");
  await application(root, regenerate).apply(plan, plan.fingerprint);
  await assert.rejects(readFile(join(root, alphaFilled)), { code: "ENOENT" });
  for (const edit of plan.edits) {
    assert.equal(await readFile(join(root, edit.path), "utf8"), edit.after);
  }
  for (const input of plan.inputs.filter((input) => !plan.edits.some((edit) => edit.path === input.path) && input.path !== plan.removalPath && !plan.generatedPaths.includes(input.path))) {
    assert.equal(await readFile(join(root, input.path), "utf8"), input.content, input.path);
    if (!input.path.includes("/generated/")) {
      assert.equal((await lstat(join(root, input.path))).mtimeMs, before[join(root, input.path)].mtime, input.path);
    }
  }
  assert.equal((await synchroniseIconsCatalogue(join(root, "packages/icons"), true)).changedPaths.length, 0);
  assert.deepEqual(await recoveryEntries(root), []);
});

test("applies independent last-glyph removal and preserves empty collection declarations", async (t) => {
  for (const selector of ["fixture/beta@outline", "fixture/alpha-icon@filled"]) {
    await t.test(selector, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      if (selector.endsWith("@filled")) {
        await write(root, collectionPath, collection().replace(/^import \{ AlphaIconOutline \}[^\n]*\n/mu, "").replace("outline: AlphaIconOutline, ", ""));
        await regenerate();
      }
      const plan = await planner.plan(selector);
      await application(root, regenerate).apply(plan, plan.fingerprint);
      assert.match(await readFile(join(root, collectionPath), "utf8"), /Collection.define/u);
      assert.deepEqual(await recoveryEntries(root), []);
    });
  }
});

test("rejects stale token, preimage, inventory and absence before any canonical write", async (t) => {
  for (const change of ["token", "preimage", "inventory", "absence"]) {
    await t.test(change, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      if (change === "preimage") {
        await write(root, collectionPath, collection() + "\n");
      } else if (change === "inventory") {
        await write(root, "packages/icons/src/new.ts", "export {};\n");
      } else if (change === "absence") {
        const path = plan.absentPaths[0];
        assert.notEqual(path, undefined);
        await write(root, path, "new competing file");
      }
      const before = await fingerprintTree(root);
      await assert.rejects(application(root, regenerate).apply(plan, change === "token" ? "0".repeat(64) : plan.fingerprint), /fingerprint|changed|appeared/u);
      assert.deepEqual(await fingerprintTree(root), before);
      assert.deepEqual(await recoveryEntries(root), []);
    });
  }
});

test("guards source and dist links/hardlinks before source mutation", async (t) => {
  for (const kind of ["source-hardlink", "dist-junction", "dist-hardlink"]) {
    await t.test(kind, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      await write(root, "outside/retain.txt", "never touch");
      if (kind === "source-hardlink") {
        await link(join(root, alphaFilled), join(root, "outside/copy.ts"));
      } else if (kind === "dist-junction") {
        await symlink(join(root, "outside"), join(root, "packages/icons/dist"), process.platform === "win32" ? "junction" : "dir");
      } else {
        await mkdir(join(root, "packages/icons/dist"));
        await link(join(root, "outside/retain.txt"), join(root, "packages/icons/dist/copied.txt"));
      }
      await assert.rejects(application(root, regenerate).apply(plan, plan.fingerprint), /linked|Linked|changed/u);
      assert.equal(await readFile(join(root, "outside/retain.txt"), "utf8"), "never touch");
      assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
      assert.deepEqual(await recoveryEntries(root), []);
    });
  }
});

test("preparation failures never mutate canonical sources", async (t) => {
  for (const operation of ["lock", "mkdir", "original", "prepared", "probe", "record"]) {
    await t.test(operation, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      const effects = {
        ...nodeFileSystem,
        async writeFile(path, ...args) {
          if ((operation === "lock" && path.endsWith(".lock")) || (operation === "original" && path.endsWith(".original")) || (operation === "prepared" && path.endsWith(".prepared")) || (operation === "record" && path.endsWith("record-0.json"))) {
            throw new Error(`injected ${operation}`);
          }
          return writeFile(path, ...args);
        },
        async mkdir(...args) {
          if (operation === "mkdir") {
            throw new Error("injected mkdir");
          }
          return mkdir(...args);
        },
        async link(...args) {
          if (operation === "probe") {
            throw new Error("injected probe");
          }
          return link(...args);
        },
      };
      await assert.rejects(application(root, regenerate, effects).apply(plan, plan.fingerprint), new RegExp(`injected ${operation}`, "u"));
      assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
      assert.equal(await readFile(join(root, alphaFilled), "utf8"), icon("alpha-icon", "filled", "AlphaIconFilled"));
    });
  }
});

test("source publication failures restore exact displaced bytes in reverse order", async (t) => {
  for (const operation of ["first-rename", "publication", "quarantine", "after-quarantine"]) {
    await t.test(operation, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      let triggered = false;
      const effects = {
        ...nodeFileSystem,
        async rename(from, to) {
          if (!triggered && ((operation === "first-rename" && from.endsWith(".collection.ts")) || (operation === "quarantine" && from.endsWith(".icon.ts")))) {
            triggered = true;
            throw new Error(`injected ${operation}`);
          }
          return nodeFileSystem.rename(from, to);
        },
        async link(from, to) {
          if (!triggered && operation === "publication" && to.endsWith(".collection.ts")) {
            triggered = true;
            throw new Error("injected publication");
          }
          return link(from, to);
        },
        async writeFile(path, ...args) {
          if (!triggered && operation === "after-quarantine" && path.endsWith("record-4.json")) {
            triggered = true;
            throw new Error("injected after-quarantine");
          }
          return writeFile(path, ...args);
        },
      };
      await assert.rejects(application(root, regenerate, effects).apply(plan, plan.fingerprint), /injected/u);
      assert.equal(triggered, true);
      assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
      assert.equal(await readFile(join(root, alphaFilled), "utf8"), icon("alpha-icon", "filled", "AlphaIconFilled"));
      assert.equal((await synchroniseIconsCatalogue(join(root, "packages/icons"), true)).changedPaths.length, 0);
    });
  }
});

test("preserves competing publication and rollback destinations with complete originals", async (t) => {
  for (const conflict of ["publish", "edited-postimage", "restore", "displaced-preimage"]) {
    await t.test(conflict, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      let triggered = false;
      const effects = {
        ...nodeFileSystem,
        async rename(from, to) {
          if (!triggered && conflict === "displaced-preimage" && from.endsWith(".collection.ts")) {
            triggered = true;
            await writeFile(from, "new maintainer preimage");
          }
          if (!triggered && ["edited-postimage", "restore"].includes(conflict) && from.endsWith(".icon.ts")) {
            triggered = true;
            if (conflict === "edited-postimage") {
              await write(root, collectionPath, "new maintainer postimage");
            }
            throw new Error("stop before quarantine");
          }
          return nodeFileSystem.rename(from, to);
        },
        async link(from, to) {
          if (!triggered && conflict === "publish" && to.endsWith(".collection.ts")) {
            triggered = true;
            await writeFile(to, "competing publisher");
          } else if (conflict === "restore" && from.endsWith(".displaced") && to.endsWith(".collection.ts")) {
            await writeFile(to, "competing restorer");
          }
          return link(from, to);
        },
      };
      await assert.rejects(application(root, regenerate, effects).apply(plan, plan.fingerprint), /Recovery directory:/u);
      const expected = { publish: "competing publisher", "edited-postimage": "new maintainer postimage", restore: "competing restorer", "displaced-preimage": "new maintainer preimage" }[conflict];
      assert.equal(await readFile(join(root, collectionPath), "utf8"), expected);
      const evidence = (await recoveryEntries(root)).find((name) => name !== ".aster-icon-removal.lock");
      assert.equal(await readFile(join(root, "packages/icons", evidence, "0.original"), "utf8"), collection());
      await assert.rejects(planner.plan(plan.identity), /interrupted/u);
    });
  }
});

test("accepted sources remain applied on generation, compilation or final-check failure", async (t) => {
  for (const stage of ["generation", "build", "postimage", "emitted"]) {
    await t.test(stage, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      const build = applicationBuild(root, regenerate);
      const failing = {
        async prepare() {},
        async run() {
          if (stage === "generation") {
            throw new Error("injected generation failure");
          }
          await build.run();
          if (stage === "build") {
            throw new Error("injected build failure");
          }
          if (stage === "postimage") {
            const output = plan.outputs.find((output) => output.content !== undefined && output.path.endsWith(".ts"));
            await write(root, output.path, "modified generated output\n");
          } else if (stage === "emitted") {
            await write(root, alphaFilled.replace("/src/", "/dist/").replace(/\.ts$/u, ".js"), "stale emitted file\n");
          }
        },
      };
      await assert.rejects(new CatalogueIconRemovalApplicator(root, failing).apply(plan, plan.fingerprint), /Sources accepted: yes; generated\/emitted verification is incomplete/u);
      assert.equal(await readFile(join(root, collectionPath), "utf8"), plan.edits[0].after);
      await assert.rejects(readFile(join(root, alphaFilled)), { code: "ENOENT" });
      assert.equal((await recoveryEntries(root)).length, 2);
    });
  }
});

test("command application replans, presents the proposal, and invokes only an explicit matching-token capability", async (t) => {
  const { planner } = await fixture(t);
  const plan = await planner.plan("fixture/alpha-icon@filled");
  const output = [];
  const host = { argv: ["node", "remove", plan.identity, "--apply", plan.fingerprint], stdout: { write: (text) => output.push(text) }, stderr: { write() { assert.fail("Unexpected stderr"); } } };
  let applied = 0;
  await new CatalogueIconRemovalCommand({ async plan(identity) { assert.equal(identity, plan.identity); return plan; } }, host, {
    async apply(received, token) {
      assert.equal(received, plan);
      assert.equal(token, plan.fingerprint);
      assert.match(output.join(""), /Icon removal preview/u);
      applied++;
    },
  }).run();
  assert.equal(applied, 1);
  assert.match(output.join(""), /Icon removal applied/u);
});

test("partial writes, publication cleanup, rollback errors and cleanup conflicts retain truthful evidence", async (t) => {
  for (const boundary of ["partial-original", "published-unlink", "rollback-link", "cleanup-unlink", "unknown-evidence", "source-check", "completed-rename-error"]) {
    await t.test(boundary, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      let triggered = false;
      const effects = {
        ...nodeFileSystem,
        async writeFile(path, ...args) {
          if (!triggered && boundary === "partial-original" && path.endsWith("0.original")) {
            triggered = true;
            await writeFile(path, "partial");
            throw new Error("injected partial original");
          }
          return writeFile(path, ...args);
        },
        async rename(from, to) {
          if (boundary === "rollback-link" && from.endsWith(".icon.ts")) {
            throw new Error("injected quarantine");
          }
          await nodeFileSystem.rename(from, to);
          if (!triggered && boundary === "completed-rename-error" && from.endsWith(".collection.ts")) {
            triggered = true;
            throw new Error("injected error after completed rename");
          }
          if (!triggered && boundary === "unknown-evidence" && from.endsWith(".collection.ts")) {
            triggered = true;
            await writeFile(join(dirname(to), "user.txt"), "preserve unrelated evidence");
          }
        },
        async link(from, to) {
          if (boundary === "rollback-link" && from.endsWith(".displaced") && to.endsWith(".collection.ts")) {
            triggered = true;
            throw new Error("injected rollback link");
          }
          return link(from, to);
        },
        async unlink(path) {
          if (!triggered && ((boundary === "published-unlink" && path.endsWith("0.prepared")) || (boundary === "cleanup-unlink" && path.endsWith("0.original")))) {
            triggered = true;
            throw new Error(`injected ${boundary}`);
          }
          await unlink(path);
          if (!triggered && boundary === "source-check" && path.endsWith("0.prepared")) {
            triggered = true;
            await write(root, "packages/icons/src/extra.ts", "export {};\n");
          }
        },
      };
      let message = "";
      await assert.rejects(application(root, regenerate, effects).apply(plan, plan.fingerprint), (error) => {
        message = error.message;
        return /Recovery directory:/u.test(message);
      });
      assert.equal(triggered, true);
      const evidence = (await recoveryEntries(root)).find((name) => name !== ".aster-icon-removal.lock");
      if (boundary === "unknown-evidence") {
        assert.equal(await readFile(join(root, "packages/icons", evidence, "user.txt"), "utf8"), "preserve unrelated evidence");
      }
      if (["cleanup-unlink", "unknown-evidence"].includes(boundary)) {
        assert.match(message, /distribution verified; evidence cleanup incomplete/u);
        await assert.rejects(readFile(join(root, alphaFilled)), { code: "ENOENT" });
      } else if (boundary === "source-check") {
        assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
        assert.equal(await readFile(join(root, "packages/icons/src/extra.ts"), "utf8"), "export {};\n");
      } else if (boundary === "completed-rename-error") {
        assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
        assert.match(message, /Restored:/u);
      }
    });
  }
});

test("cooperative marker conflicts and replaced recovery directories do not grant writes elsewhere", async (t) => {
  for (const boundary of ["existing-lock", "changed-lock", "recovery-junction"]) {
    await t.test(boundary, async (t) => {
      const { root, regenerate, planner } = await fixture(t);
      const plan = await planner.plan("fixture/alpha-icon@filled");
      const lock = join(root, "packages/icons/.aster-icon-removal.lock");
      await write(root, "outside/retain.txt", "protected external data");
      if (boundary === "existing-lock") {
        await writeFile(lock, "another removal owns this marker");
      }
      const effects = {
        ...nodeFileSystem,
        async writeFile(path, ...args) {
          await writeFile(path, ...args);
          if (boundary === "changed-lock" && path.endsWith("record-1.json")) {
            await writeFile(lock, "changed marker; do not delete");
          }
        },
        async mkdir(path, ...args) {
          await mkdir(path, ...args);
          if (boundary === "recovery-junction") {
            await nodeFileSystem.rename(path, path + "-original");
            await symlink(join(root, "outside"), path, process.platform === "win32" ? "junction" : "dir");
          }
        },
      };
      await assert.rejects(application(root, regenerate, effects).apply(plan, plan.fingerprint), /interrupted|preimage changed|linked|non-regular/u);
      assert.equal(await readFile(join(root, collectionPath), "utf8"), collection());
      assert.equal(await readFile(join(root, "outside/retain.txt"), "utf8"), "protected external data");
      assert.deepEqual(await readdir(join(root, "outside")), ["retain.txt"]);
      if (boundary !== "recovery-junction") {
        assert.equal(await readFile(lock, "utf8"), boundary === "existing-lock" ? "another removal owns this marker" : "changed marker; do not delete");
      }
    });
  }
});

async function compilableFixture(t) {
  const { root, regenerate, planner } = await fixture(t);
  const realRoot = resolve(".");
  const actualRunner = process.env.npm_execpath ?? join(dirname(process.execPath), "node_modules/pnpm/bin/pnpm.cjs");
  // The fake pnpm entry delegates to the real host; no package installation is needed.
  const runner = join(root, "pnpm-host.cjs");
  await writeFile(runner, `require(${JSON.stringify(actualRunner)});\n`);
  await write(root, "packages/core/dist/index.js", "export {};\n");
  await write(root, "packages/core/dist/index.d.ts", "export {};\n");
  for (const path of [alphaOutline, alphaFilled, betaOutline]) {
    const text = await readFile(join(root, path), "utf8");
    await write(root, path, text.replace('rtl: "preserve",', 'rtl: "preserve", presentation: { defaults: { fill: "currentColor" }, overrides: [] },'));
  }
  for (const family of ["dynamic", "manifest"]) {
    const directory = `packages/icons/src/${family}/contracts`;
    for (const name of await readdir(join(realRoot, directory))) {
      await write(root, `${directory}/${name}`, await readFile(join(realRoot, directory, name), "utf8"));
    }
    await write(root, `packages/icons/src/${family}/index.ts`, await readFile(join(realRoot, `packages/icons/src/${family}/index.ts`), "utf8"));
  }
  await write(root, "tsconfig.base.json", JSON.stringify({ compilerOptions: {
    target: "ES2022", module: "ESNext", moduleResolution: "Bundler", declaration: true, strict: true, skipLibCheck: true,
    paths: { "@luscious-garden/aster-core": [join(realRoot, "packages/core/dist/index.d.ts")] },
  } }));
  await write(root, "packages/icons/tsconfig.json", JSON.stringify({ extends: "../../tsconfig.base.json", compilerOptions: { rootDir: "src", outDir: "dist" }, include: ["src/**/*.ts"] }));
  const producer = pathToFileURL(join(realRoot, "tooling/catalogue/synchronise-icons-catalogue.mjs")).href;
  const compiler = join(realRoot, "node_modules/typescript/bin/tsc");
  await write(root, "build.mjs", `import { synchroniseIconsCatalogue } from ${JSON.stringify(producer)};
import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
await synchroniseIconsCatalogue(process.cwd());
await rm("dist", { recursive: true, force: true });
const result = spawnSync(process.execPath, [${JSON.stringify(compiler)}, "-p", "tsconfig.json"], { stdio: "inherit" });
process.exitCode = result.status ?? 1;
`);
  const packagePath = join(root, "packages/icons/package.json");
  const manifest = JSON.parse(await readFile(packagePath, "utf8"));
  manifest.name = "@luscious-garden/aster-icons";
  manifest.version = "0.0.0-removal-fixture";
  manifest.private = false;
  manifest.files = ["dist"];
  manifest.dependencies = { "@luscious-garden/aster-core": JSON.parse(await readFile(join(realRoot, "packages/core/package.json"), "utf8")).version };
  for (const family of ["dynamic", "manifest"]) {
    manifest.exports[`./${family}`] = { types: `./dist/${family}/index.d.ts`, import: `./dist/${family}/index.js` };
  }
  manifest.exports["./collections/*"] = { types: "./dist/generated/facades/collections/*.d.ts", import: "./dist/generated/facades/collections/*.js" };
  manifest.scripts = { build: "node ../../build.mjs" };
  await writeFile(packagePath, JSON.stringify(manifest, null, 2) + "\n");
  await regenerate();
  const previousRunner = process.env.npm_execpath;
  process.env.npm_execpath = runner;
  const build = new NodeCatalogueIconRemovalBuild(root);
  if (previousRunner === undefined) {
    delete process.env.npm_execpath;
  } else {
    process.env.npm_execpath = previousRunner;
  }
  return { root, regenerate, planner, build, runner, compiler };
}

test("uses the existing pnpm build host and real TypeScript compilation in an owned checkout", async (t) => {
  const { root, planner, build } = await compilableFixture(t);
  await build.prepare();
  await build.run();
  const plan = await planner.plan("fixture/alpha-icon@filled");
  await new CatalogueIconRemovalApplicator(root, build).apply(plan, plan.fingerprint);
  const outline = join(root, "packages/icons/dist/glyphs/a/alpha-icon/alpha-icon-outline.icon.js");
  assert.match(await readFile(outline, "utf8"), /AlphaIconOutline/u);
  const dictionary = await readFile(join(root, "packages/icons/dist/generated/facades/glyphs/alpha-icon.js"), "utf8");
  assert.doesNotMatch(dictionary, /Filled/u);
  assert.deepEqual(await recoveryEntries(root), []);
});

test("applies BOM/CRLF alias edits without rewriting retained authored text", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  const before = "\uFEFF" + collection().replaceAll('"', "'").replace("import { AlphaIconFilled }", "import { AlphaIconFilled as Selected }").replace("filled: AlphaIconFilled", "filled: Selected").replaceAll("\n", "\r\n");
  await write(root, collectionPath, before);
  await regenerate();
  const plan = await planner.plan("fixture/alpha-icon@filled");
  await application(root, regenerate).apply(plan, plan.fingerprint);
  assert.equal(await readFile(join(root, collectionPath), "utf8"), plan.edits[0].after);
  assert.equal(plan.edits[0].after.startsWith("\uFEFF"), true);
  assert.equal(plan.edits[0].after.replaceAll("\r\n", "").includes("\n"), false);
  assert.match(plan.edits[0].after, /description: 'Untouched metadata\.'/u);
});

test("rejects malformed apply arguments before acquiring a proposal or application authority", async () => {
  for (const args of [
    ["fixture/a@outline", "--apply"],
    ["fixture/a@outline", "--apply", "short"],
    ["fixture/a@outline", "--apply", "F".repeat(64)],
    ["fixture/a@outline", "--apply", "0".repeat(64), "extra"],
    ["fixture/a@outline", "--force"],
  ]) {
    const host = { argv: ["node", "remove", ...args], stdout: { write() { assert.fail("Unexpected proposal"); } }, stderr: { write(text) { assert.match(text, /^Usage:/u); } }, exitCode: 0 };
    await new CatalogueIconRemovalCommand({ async plan() { assert.fail("Unexpected planning"); } }, host, { async apply() { assert.fail("Unexpected application"); } }).run();
    assert.equal(host.exitCode, 1);
  }
});

test("reports success only after real application and rejects a stale token without changing the fixture", async (t) => {
  const { root, regenerate, planner } = await fixture(t);
  const applicator = application(root, regenerate);
  const output = [];
  const errors = [];
  const host = {
    argv: ["node", "remove", "fixture/alpha-icon@filled"],
    stdout: { write(text) { output.push(text); } },
    stderr: { write(text) { errors.push(text); } },
    exitCode: 0,
  };
  await new CatalogueIconRemovalCommand(planner, host, applicator).run();
  assert.equal(host.exitCode, 0);
  assert.deepEqual(errors, []);
  const fingerprint = /Fingerprint: ([a-f0-9]{64})/u.exec(output.join(""))[1];
  const before = await fingerprintTree(root);
  host.argv.push("--apply", "0".repeat(64));
  output.length = 0;
  await new CatalogueIconRemovalCommand(planner, host, applicator).run();
  assert.equal(host.exitCode, 1);
  assert.match(errors.join(""), /application failed:[\s\S]*fingerprint does not match/u);
  assert.doesNotMatch(output.join(""), /Icon removal applied/u);
  assert.deepEqual(await fingerprintTree(root), before);
  host.argv[4] = fingerprint;
  host.exitCode = 0;
  output.length = 0;
  errors.length = 0;
  await new CatalogueIconRemovalCommand(planner, host, applicator).run();
  assert.equal(host.exitCode, 0);
  assert.deepEqual(errors, []);
  assert.match(output.join(""), /Icon removal applied; sources, generated outputs and emitted distribution verified/u);
  await assert.rejects(readFile(join(root, alphaFilled)), { code: "ENOENT" });
  assert.deepEqual(await recoveryEntries(root), []);
});

test("retains native and offline packed consumers across multi-collection and final-glyph removal", async (t) => {
  const { root, regenerate, planner, build, runner, compiler } = await compilableFixture(t);
  const second = "packages/icons/src/collections/s/second/second.collection.ts";
  await write(root, second, collection("second", "Second").replace("alphaIcon:", "alternate:"));
  await regenerate();
  await build.prepare();
  await build.run();
  const run = (args, cwd = root) => {
    const result = spawnSync(process.execPath, [runner, ...args], { cwd, encoding: "utf8", windowsHide: true });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    return result;
  };
  const archives = join(root, "archives");
  await mkdir(archives);
  const coreArchive = JSON.parse(run(["--dir", resolve("packages/core"), "pack", "--pack-destination", archives, "--json"]).stdout).filename;
  const coreSpec = pathToFileURL(resolve(archives, coreArchive)).href;
  await write(root, "package.json", JSON.stringify({ private: true, type: "module", dependencies: { "@luscious-garden/aster-core": coreSpec } }));
  run(["--dir", root, "install", "--offline", "--ignore-scripts", "--frozen-lockfile=false"]);
  const removed = [];
  const inspect = (packed) => `
import assert from "node:assert/strict";
const removed = ${JSON.stringify(removed)};
const prefix = ${JSON.stringify(packed ? "@luscious-garden/aster-icons/" : pathToFileURL(join(root, "packages/icons/dist/")).href)};
const load = (publicPath, directPath) => import(prefix + (${packed} ? publicPath : directPath));
const { AsterIconManifest, AsterCollectionManifest } = await load("manifest", "manifest/index.js");
const { AsterIconLoaders, AsterCollectionLoaders } = await load("dynamic", "dynamic/index.js");
const { AlphaIconVariants } = await load("alpha-icon", "generated/facades/glyphs/alpha-icon.js");
const { AlphaIconOutline } = await load("alpha-icon/outline", "generated/facades/icons/alpha-icon/outline.js");
assert.equal(AlphaIconVariants.outline, AlphaIconOutline);
assert.equal(AsterIconManifest.length, 3 - removed.length);
assert.equal(Object.isFrozen(AlphaIconVariants), true);
assert.equal(Object.getPrototypeOf(AlphaIconVariants), null);
for (const entry of AsterIconManifest) assert.deepEqual((await AsterIconLoaders[entry.key]()).identity, entry.identity);
for (const entry of AsterCollectionManifest) {
  const collection = await AsterCollectionLoaders[entry.key]();
  assert.deepEqual(collection.members.map((icon) => icon.identity.namespace + "/" + icon.identity.name + "@" + icon.identity.variant), entry.members);
  assert.equal(collection.members[0], AlphaIconOutline);
  assert.equal(collection.metadata.description, "Untouched metadata.");
}
for (const key of removed) {
  assert.equal(AsterIconManifest.some((entry) => entry.key === key), false);
  assert.equal(Object.hasOwn(AsterIconLoaders, key), false);
  const [name, variant] = key.slice("fixture/".length).split("@");
  await assert.rejects(load(name + "/" + variant, "generated/facades/icons/" + name + "/" + variant + ".js"), { code: "ERR_MODULE_NOT_FOUND" });
  if (name === "beta") await assert.rejects(load("beta", "generated/facades/glyphs/beta.js"), { code: "ERR_MODULE_NOT_FOUND" });
}
assert.equal(Object.hasOwn(AlphaIconVariants, "filled"), !removed.includes("fixture/alpha-icon@filled"));
`;
  for (let stage = 0; stage < 3; stage++) {
    const native = spawnSync(process.execPath, ["--input-type=module", "--eval", inspect(false)], { cwd: root, encoding: "utf8" });
    assert.equal(native.error, undefined);
    assert.equal(native.status, 0, native.stderr);
    const iconsArchive = JSON.parse(run(["--dir", join(root, "packages/icons"), "pack", "--pack-destination", archives, "--json"]).stdout).filename;
    const consumer = join(root, `consumer-${stage}`);
    const specs = { "@luscious-garden/aster-core": coreSpec, "@luscious-garden/aster-icons": pathToFileURL(resolve(archives, iconsArchive)).href };
    await write(root, `consumer-${stage}/package.json`, JSON.stringify({ private: true, type: "module", dependencies: specs, pnpm: { overrides: specs } }));
    run(["--dir", consumer, "install", "--offline", "--ignore-scripts", "--frozen-lockfile=false"]);
    const packed = spawnSync(process.execPath, ["--input-type=module", "--eval", inspect(true)], { cwd: consumer, encoding: "utf8" });
    assert.equal(packed.error, undefined);
    assert.equal(packed.status, 0, packed.stderr);
    const source = [
      'import { AlphaIconVariants } from "@luscious-garden/aster-icons/alpha-icon";',
      'import { Sample } from "@luscious-garden/aster-icons/collections/sample";',
      'import type { IconDefinition } from "@luscious-garden/aster-core";',
      "const retained: IconDefinition = AlphaIconVariants.outline;",
      "const selected: IconDefinition = Sample.icons.alphaIcon.outline;",
      ...(stage >= 1 ? [
        "// @ts-expect-error Removed treatments do not remain in the dictionary type.",
        "AlphaIconVariants.filled;",
        "// @ts-expect-error Removed membership does not remain in the collection type.",
        "Sample.icons.alphaIcon.filled;",
        "// @ts-expect-error Removed public leaves have no declarations.",
        'import type { AlphaIconFilled } from "@luscious-garden/aster-icons/alpha-icon/filled";',
      ] : []),
      ...(stage === 2 ? [
        "// @ts-expect-error A removed final-glyph dictionary has no declarations.",
        'import type { BetaVariants } from "@luscious-garden/aster-icons/beta";',
      ] : []),
      "void [retained, selected];",
    ].join("\n");
    await write(root, `consumer-${stage}/consumer.ts`, source);
    const types = spawnSync(process.execPath, [compiler, "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "ESNext", "--moduleResolution", "Bundler", join(consumer, "consumer.ts")], { cwd: consumer, encoding: "utf8" });
    assert.equal(types.error, undefined);
    assert.equal(types.status, 0, types.stdout + types.stderr);
    const installed = join(consumer, "node_modules/@luscious-garden/aster-icons");
    await assert.rejects(lstat(join(installed, "src")), { code: "ENOENT" });
    assert.deepEqual(await recoveryEntries(root), []);
    if (stage < 2) {
      const selector = stage === 0 ? "fixture/alpha-icon@filled" : "fixture/beta@outline";
      const plan = await planner.plan(selector);
      assert.equal(plan.edits.length, stage === 0 ? 2 : 0);
      await new CatalogueIconRemovalApplicator(root, build).apply(plan, plan.fingerprint);
      removed.push(selector);
      assert.equal((await synchroniseIconsCatalogue(join(root, "packages/icons"), true)).changedPaths.length, 0);
    }
  }
});
