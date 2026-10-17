import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import { catalogueSourceGeneration } from "../../tooling/catalogue/constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceExportsPlanner } from "../../tooling/catalogue/runtime/catalogue-source-exports.planner.mjs";
import { CatalogueSourceFacadeResolver } from "../../tooling/catalogue/runtime/catalogue-source-facade.resolver.mjs";
import { CatalogueSourceSynchroniser } from "../../tooling/catalogue/runtime/catalogue-source.synchroniser.mjs";
import { NodeCatalogueSourceFileSystem } from "../../tooling/catalogue/runtime/node-catalogue-source-file-system.mjs";
import { IconsPackagePolicy } from "../../tooling/architecture/runtime/icons-package.policy.mjs";
import { packageBoundaries } from "../../tooling/architecture/constants/package-boundaries.constant.mjs";
import { RepositoryFileWalker } from "../../tooling/shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

const paths = new RepositoryPathResolver();
const facades = new CatalogueSourceFacadeResolver();
const family = catalogueSourceGeneration.families[0];
const legacy = { types: "./dist/generated/facades/icons/*.d.ts", import: "./dist/generated/facades/icons/*.js" };

async function fixture(t, manifest = '{"private":true,"exports":{"./*":' + JSON.stringify(legacy) + "}}\n") {
  const root = await mkdtemp(join(tmpdir(), "aster-catalogue-exports-"));
  t.after(() => rm(root, {recursive:true,force:true}));
  await writeFile(resolve(root, "package.json"), manifest, "utf8");
  return root;
}

function inspections(variants) {
  return [{family, modules: variants.map((variant) => ({name:"camera",variant}))}];
}

function planner(fileSystem = new NodeCatalogueSourceFileSystem()) {
  return new CatalogueSourceExportsPlanner(fileSystem, paths, facades);
}

function synchroniser(root, fileSystem = new NodeCatalogueSourceFileSystem()) {
  const output = (relativePath) => ({path:resolve(root,relativePath),relativePath,content:"generated\n"});
  return new CatalogueSourceSynchroniser(
    fileSystem,
    { reset() {}, async inspect() { return inspections(["outline"])[0].modules; } },
    { plan() { return [output("src/generated/facades/icons/camera/outline.ts")]; } },
    { plan() { return output("src/generated/manifest/index.ts"); } },
    { plan() { return output("src/generated/dynamic/index.ts"); } },
    paths, {validate() {}}, new RepositoryFileWalker(fileSystem, paths),
    [family], catalogueSourceGeneration.facadeRoot, planner(fileSystem),
  );
}

test("derives sorted patterns from actual treatments while retaining all manual property text", async (t) => {
  const before = '\uFEFF{\r\n\t"name" : "fixture",\r\n\t"exports": {\r\n\t\t"./manifest" : { "import" : "./metadata.js" },\r\n\t\t"./*": ' + JSON.stringify(legacy) + '\r\n\t},\r\n\t"custom" : { "spacing" : "retain" }\r\n}\r\n';
  const root = await fixture(t, before);
  const subject = planner();
  const variants = ["outline","index","constructor","filled-dotted","2-tone","outline"];
  const edit = await subject.plan(root, inspections(variants));
  assert.ok(edit);
  assert.equal(edit.expectedContent, before);
  assert.ok(Object.isFrozen(edit) && Object.isFrozen(edit.output));
  assert.equal(await readFile(resolve(root,"package.json"),"utf8"), before);
  assert.ok(edit.output.content.startsWith(before.slice(0,before.indexOf('"exports"'))));
  assert.ok(edit.output.content.endsWith(before.slice(before.lastIndexOf('\r\n\t"custom"'))));
  assert.ok(edit.output.content.includes('\t\t"./manifest" : { "import" : "./metadata.js" }'));
  const result = JSON.parse(edit.output.content.slice(1));
  assert.deepEqual(Object.keys(result.exports), ["./manifest","./*/2-tone","./*/constructor","./*/filled-dotted","./*/index","./*/outline","./*"]);
  for (const variant of new Set(variants)) {
    assert.deepEqual(result.exports[`./*/${variant}`], facades.exportTarget(family,variant));
  }
  await new NodeCatalogueSourceFileSystem().replaceText(edit.output.path,edit.expectedContent,edit.output.content);
  assert.equal(await subject.plan(root, inspections(variants)), undefined);
  const removed = await subject.plan(root, inspections(["outline"]));
  assert.ok(removed);
  assert.deepEqual(Object.keys(JSON.parse(removed.output.content.slice(1)).exports),["./manifest","./*/outline","./*"]);
  assert.equal(JSON.parse(removed.output.content.slice(1)).custom.spacing,"retain");
});

test("rejects ambiguous, malformed or conflicting manifest ownership without writes", async (t) => {
  const cases = [
    ["[]", /must be an object/u],
    ["{}", /exports object/u],
    ['{"exports":null}', /exports object/u],
    ['{"exports":{},"exports":{}}', /Duplicate package JSON property/u],
    ['{"exports":{"./*":{"types":"a","types":"b","import":"c"}}}', /Duplicate package JSON property/u],
    ['{"exports":{/* comment */}}', /strict JSON/u],
    ['{"exports":{"./*":{"import":"./manual.js"}}}', /Conflicting owned export target/u],
    ['{"exports":{"./*/outline":{"types":"./manual.d.ts","import":"./manual.js"}}}', /Conflicting owned export target/u],
    ['{"exports":{"./camera":"./manual.js"}}', /shadows a generated glyph/u],
    ['{"exports":{"./camera/outline":"./manual.js"}}', /shadows a generated treatment/u],
    ['{"exports":{"./custom/*":"./manual.js"}}', /Conflicting manual export pattern/u],
    ['{"exports":{"./*/filledDotted":{}}}', /Invalid owned treatment export/u],
  ];
  for (const [source,pattern] of cases) {
    await t.test(source, async (t) => {
      const root = await fixture(t,source);
      await assert.rejects(planner().plan(root,inspections(["outline"])),pattern);
      assert.equal(await readFile(resolve(root,"package.json"),"utf8"),source);
      assert.deepEqual(await readdir(root),["package.json"]);
    });
  }
});

test("rejects inherited export conditions instead of claiming unrelated own properties", async () => {
  const source = '{"exports":{"./*":{"browser":"./manual.js","require":"./manual.cjs"}}}';
  const subject = planner({ async entries() { return []; }, async readText() { return source; } });
  const expected = facades.exportTarget(family, undefined);
  const previous = ["types", "import"].map((key) => [key, Object.getOwnPropertyDescriptor(Object.prototype, key)]);
  try {
    for (const key of ["types", "import"]) {
      Object.defineProperty(Object.prototype, key, { configurable: true, writable: true, value: expected[key] });
    }
    await assert.rejects(
      subject.plan(resolve(tmpdir(), "aster-inherited-export-probe"), inspections(["outline"])),
      /Conflicting owned export target/u,
    );
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) {
        Object.defineProperty(Object.prototype, key, descriptor);
      } else {
        Reflect.deleteProperty(Object.prototype, key);
      }
    }
  }
});

test("matches decoded own target literals but still canonicalises their exact serialised text", async (t) => {
  const source = '{"exports":{"./*":{"im\\u0070ort":".\\/dist/generated/facades/glyphs/*.js","ty\\u0070es":"./dist/generated/facades/glyphs/*.d.ts"}}}';
  const root = await fixture(t, source);
  const subject = planner();
  const edit = await subject.plan(root, inspections(["outline"]));
  assert.ok(edit);
  assert.equal(edit.expectedContent, source);
  assert.deepEqual(JSON.parse(edit.output.content).exports["./*"], facades.exportTarget(family, undefined));
  await writeFile(resolve(root, "package.json"), edit.output.content, "utf8");
  assert.equal(await subject.plan(root, inspections(["outline"])), undefined);
  const drift = edit.output.content.replace('"./*/outline": {', '"./*/outline" : {');
  assert.notEqual(drift, edit.output.content);
  await writeFile(resolve(root, "package.json"), drift, "utf8");
  assert.equal((await subject.plan(root, inspections(["outline"]))).output.content, edit.output.content);
});

test("rejects non-literal or additional owned conditions without changing the manifest", async (t) => {
  const expected = facades.exportTarget(family, undefined);
  const targets = [null, expected.import, [expected],
    { types: expected.types, import: { default: expected.import } },
    { types: expected.types, import: expected.import, browser: expected.import },
    { types: false, import: expected.import },
  ];
  for (const target of targets) {
    await t.test(JSON.stringify(target), async (t) => {
      const source = JSON.stringify({ exports: { "./*": target } });
      const root = await fixture(t, source);
      await assert.rejects(planner().plan(root, inspections(["outline"])), /Conflicting owned export target/u);
      assert.equal(await readFile(resolve(root, "package.json"), "utf8"), source);
    });
  }
});

test("preserves interrupted package stages and backups until explicit inspection", async (t) => {
  for (const name of ["package.json.stage-interrupted", "package.json.backup-interrupted"]) {
    await t.test(name, async (t) => {
      const root = await fixture(t);
      await writeFile(resolve(root,name),"retained recovery evidence","utf8");
      await assert.rejects(synchroniser(root).synchronise(root,true),/requires inspection/u);
      await assert.rejects(synchroniser(root).synchronise(root,false),/requires inspection/u);
      assert.equal(await readFile(resolve(root,name),"utf8"),"retained recovery evidence");
      assert.equal((await readdir(root)).length,2);
    });
  }
});

test("detects package-only drift in check mode without counting the mixed manifest as generated", async (t) => {
  const root = await fixture(t);
  const subject = synchroniser(root);
  const before = await readFile(resolve(root,"package.json"),"utf8");
  const checked = await subject.synchronise(root,true);
  assert.equal(checked.outputCount,3);
  assert.equal(checked.changedPaths.at(-1),"package.json");
  assert.equal(await readFile(resolve(root,"package.json"),"utf8"),before);
  assert.deepEqual(await readdir(root),["package.json"]);
  assert.deepEqual(await subject.synchronise(root,false),checked);
  assert.deepEqual((await subject.synchronise(root,true)).changedPaths,[]);
  const manifest = JSON.parse(await readFile(resolve(root,"package.json"),"utf8"));
  delete manifest.exports["./*/outline"];
  await writeFile(resolve(root,"package.json"),JSON.stringify(manifest,null,2) + "\n","utf8");
  assert.deepEqual((await subject.synchronise(root,true)).changedPaths,["package.json"]);
  assert.deepEqual((await subject.synchronise(root,false)).changedPaths,["package.json"]);
});

test("rejects a manifest conflict before publishing already planned generated files", async (t) => {
  const root = await fixture(t,'{"exports":{"./camera":"./manual.js"}}');
  await assert.rejects(synchroniser(root).synchronise(root,false),/shadows a generated glyph/u);
  assert.deepEqual(await readdir(root),["package.json"]);
});

test("detects concurrent manifest edits before the first generated write", async (t) => {
  const root = await fixture(t);
  const packagePath = resolve(root,"package.json");
  let edited;
  class ChangedManifestFileSystem extends NodeCatalogueSourceFileSystem {
    async readText(path) {
      const text = await super.readText(path);
      if (path === packagePath && edited === undefined) {
        edited = text.replace('"private":true','"private":true,"manual":"new"');
        await writeFile(path,edited,"utf8");
      }
      return text;
    }
  }
  await assert.rejects(synchroniser(root,new ChangedManifestFileSystem()).synchronise(root,false),/changed during generation/u);
  assert.equal(await readFile(packagePath,"utf8"),edited);
  assert.deepEqual(await readdir(root),["package.json"]);
});

test("preserves edits made during generated publication and repairs only remaining package drift", async (t) => {
  const root = await fixture(t);
  const packagePath = resolve(root,"package.json");
  let edited;
  class ChangedDuringPublicationFileSystem extends NodeCatalogueSourceFileSystem {
    async replaceDirectory(path,files) {
      await super.replaceDirectory(path,files);
      const text = await super.readText(packagePath);
      edited = text.replace('"private":true','"private":true,"manual":"retain"');
      await writeFile(packagePath,edited,"utf8");
    }
  }
  await assert.rejects(synchroniser(root,new ChangedDuringPublicationFileSystem()).synchronise(root,false),/changed before publication/u);
  assert.equal(await readFile(packagePath,"utf8"),edited);
  const retry = synchroniser(root);
  assert.deepEqual((await retry.synchronise(root,true)).changedPaths,["package.json"]);
  assert.deepEqual((await retry.synchronise(root,false)).changedPaths,["package.json"]);
  assert.equal(JSON.parse(await readFile(packagePath,"utf8")).manual,"retain");
  assert.deepEqual((await retry.synchronise(root,true)).changedPaths,[]);
});

test("verifies displaced text and restores a concurrently edited preimage", async (t) => {
  const root = await fixture(t);
  const path = resolve(root,"package.json");
  const before = await readFile(path,"utf8");
  const edited = before + " ";
  class ChangedBeforeDisplacementFileSystem extends NodeCatalogueSourceFileSystem {
    async readText(candidate) {
      const text = await super.readText(candidate);
      if (candidate === path) {
        await writeFile(path,edited,"utf8");
      }
      return text;
    }
  }
  await assert.rejects(new ChangedBeforeDisplacementFileSystem().replaceText(path,before,"{}"),/displaced package manifest changed/u);
  assert.equal(await readFile(path,"utf8"),edited);
  assert.deepEqual(await readdir(root),["package.json"]);
});

test("rolls back a real native package publication failure and permits retry", async (t) => {
  const root = await fixture(t);
  const path = resolve(root,"package.json");
  const before = await readFile(path,"utf8");
  class MissingStageFileSystem extends NodeCatalogueSourceFileSystem {
    async readText(candidate) {
      const text = await super.readText(candidate);
      if (candidate.startsWith(`${path}.backup-`)) {
        const stage = (await readdir(root)).find((name) => name.startsWith("package.json.stage-"));
        assert.ok(stage);
        const target = resolve(root,stage);
        assert.ok(paths.contains(root,target));
        await rm(target);
      }
      return text;
    }
  }
  await assert.rejects(new MissingStageFileSystem().replaceText(path,before,"{}\n"),{code:"ENOENT"});
  assert.equal(await readFile(path,"utf8"),before);
  assert.deepEqual(await readdir(root),["package.json"]);
  await new NodeCatalogueSourceFileSystem().replaceText(path,before,"{}\n");
  assert.equal(await readFile(path,"utf8"),"{}\n");
  assert.deepEqual(await readdir(root),["package.json"]);
});

test("never overwrites a reappeared manifest and retains its displaced backup", async (t) => {
  const root = await fixture(t);
  const path = resolve(root,"package.json");
  const before = await readFile(path,"utf8");
  class ReappearedFileSystem extends NodeCatalogueSourceFileSystem {
    async readText(candidate) {
      const text = await super.readText(candidate);
      if (candidate.startsWith(`${path}.backup-`)) {
        await writeFile(path,'{"manual":"new destination"}',"utf8");
      }
      return text;
    }
  }
  await assert.rejects(new ReappearedFileSystem().replaceText(path,before,"{}"),/Concurrent package manifest preserved/u);
  assert.equal(await readFile(path,"utf8"),'{"manual":"new destination"}');
  const files = await readdir(root);
  const backup = files.find((file) => file.startsWith("package.json.backup-"));
  assert.ok(backup);
  assert.equal(await readFile(resolve(root,backup),"utf8"),before);
  assert.equal(files.some((file) => file.startsWith("package.json.stage-")),false);
});

test("keeps architecture checks strict for derived pattern targets and root entrypoints", async () => {
  const valid = {
    ...Object.fromEntries(Object.entries(packageBoundaries.iconsExports).filter(([key]) => key !== "./*")),
    "./*/outline": facades.exportTarget(family,"outline"),
    "./*/index": facades.exportTarget(family,"index"),
    "./*": facades.exportTarget(family,undefined),
  };
  const subject = new IconsPackagePolicy({ async inspect() {} });
  const inspect = async (exports) => {
    const issues = [];
    await subject.inspect({manifest:{exports,sideEffects:false},packageRoot:"fixture"},{},new Set(),{add(issue){issues.push(issue);}});
    return issues;
  };
  assert.deepEqual(await inspect(valid),[]);
  for (const exports of [
    {...valid,"./*/outline":{...valid["./*/outline"],import:"./wrong.js"}},
    {...valid,"./*/filledDotted":facades.exportTarget(family,"filledDotted")},
    {...valid,".":{import:"./aggregate.js"}},
    {...valid,"./collections/*":{import:"./wrong.js"}},
    {...valid,"./extra":"./extra.js"},
  ]) {
    assert.ok((await inspect(exports)).some((issue) => issue.includes("accepted scalable package exports")));
  }
});
