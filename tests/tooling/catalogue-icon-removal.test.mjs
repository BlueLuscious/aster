import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile, lstat, unlink, link, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { CatalogueIconRemovalCommand } from "../../tooling/catalogue/runtime/catalogue-icon-removal.command.mjs";
import { CatalogueIconRemovalPlanner } from "../../tooling/catalogue/runtime/catalogue-icon-removal.planner.mjs";
import { CatalogueIconRemovalSource } from "../../tooling/catalogue/runtime/catalogue-icon-removal-source.mjs";
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
  for (const text of [plan.fingerprint, alphaFilled, collectionPath, "docs/consumer.md:1", "@@ UTF-16", "Generated/export changes:", "Application is not implemented."]) {
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

test("the actual private entrypoint refuses --apply before any removal work", () => {
  const result = spawnSync(process.execPath, [resolve("tooling/catalogue/remove-icon.mjs"), "fixture/alpha-icon@filled", "--apply", "0".repeat(64)], { encoding: "utf8" });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /preview-only/u);
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
