import { createHash } from "node:crypto";
import { resolve } from "node:path";

import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueIconRemovalEditor } from "./catalogue-icon-removal-editor.mjs";
import { CatalogueIconRemovalSource } from "./catalogue-icon-removal-source.mjs";
import { CatalogueSourceKeySerialiser } from "./catalogue-source-key.serialiser.mjs";
import { CatalogueSourceSynchroniserFactory } from "./catalogue-source-synchroniser.factory.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans one exact canonical icon removal through static inspection and read-only producer views.
 */
export class CatalogueIconRemovalPlanner {
  /** @description Explicit workspace boundary borrowed from the command host. */
  #workspaceRoot;
  /** @description Existing complete catalogue inspection/publication composition. */
  #catalogues = new CatalogueSourceSynchroniserFactory();
  /** @description Existing canonical identity-key authority. */
  #keys = new CatalogueSourceKeySerialiser();
  /** @description Exact source-span and binding-use authority. */
  #editor = new CatalogueIconRemovalEditor();

  /**
   * @description Creates a planner scoped to one explicit checkout.
   * @param {string} workspaceRoot - Absolute or relative workspace containing packages/icons.
   */
  constructor(workspaceRoot) {
    this.#workspaceRoot = resolve(workspaceRoot);
  }

  /**
   * @description Produces an immutable exact proposal without writing or executing authored modules.
   * @param {string} selector - Exact canonical [namespace/]name@variant identity.
   * @returns {Promise<import("../contracts/internal/catalogue-icon-removal-plan.contract.mjs").ICatalogueIconRemovalPlan>} Complete reviewed preimages, effects and fingerprint.
   */
  async plan(selector) {
    this.#validateSelector(selector);
    const source = new CatalogueIconRemovalSource(this.#workspaceRoot);
    const fileSystem = source.view();
    const packageRoot = resolve(this.#workspaceRoot, "packages/icons");
    await fileSystem.entries(packageRoot);
    const baseline = await this.#catalogues.create(fileSystem).synchronise(packageRoot, true);
    if (baseline.changedPaths.length > 0) {
      throw new CatalogueSourceError(`Catalogue drift blocks removal; verify/regenerate it first: ${baseline.changedPaths.join(", ")}`);
    }
    const inspections = await this.#catalogues.inspect(packageRoot, fileSystem);
    const icons = inspections.filter(({ family }) => family.kind === catalogueSourceFamilyKinds.icon).flatMap(({ modules }) => modules);
    const selected = icons.find((module) => this.#keys.serialise(catalogueSourceFamilyKinds.icon, module.manifest.identity) === selector);
    if (selected === undefined) {
      throw new CatalogueSourceError(`Canonical icon was not found for removal: ${selector}`);
    }
    if (icons.length === 1) {
      throw new CatalogueSourceError("Removal cannot empty the canonical icon family.");
    }
    const collections = new Map(inspections.filter(({ family }) => family.kind === catalogueSourceFamilyKinds.collection)
      .flatMap(({ modules }) => modules).map((module) => [module.sourcePath, module]));
    const authored = await source.files("packages/icons/src", (path) => path.endsWith(".ts"));
    const edits = [];
    for (const path of authored) {
      const text = await fileSystem.readText(path);
      if (path === selected.sourcePath) {
        continue;
      }
      const collection = collections.get(path);
      if (collection === undefined) {
        this.#editor.rejectDependencies(path, text, selected);
      } else {
        const edit = this.#editor.plan(collection, selected, text, source.display(path));
        if (edit !== undefined) {
          edits.push(edit);
        }
      }
    }
    const removalPath = source.display(selected.sourcePath);
    const prospective = source.view(edits, removalPath);
    const producer = this.#catalogues.create(prospective);
    const generated = await producer.synchronise(packageRoot, true);
    const publication = await producer.plan(packageRoot);
    const expected = new Map([
      ...publication.outputs,
      ...publication.directories.flatMap((directory) => directory.outputs),
      ...(publication.packageEdit === undefined ? [] : [publication.packageEdit.output]),
    ].map((output) => [source.display(output.path), output.content]));
    const generatedPaths = Object.freeze(generated.changedPaths.map((path) => source.display(resolve(packageRoot, path))));
    const outputs = Object.freeze(generatedPaths.map((path) => Object.freeze({ path, content: expected.get(path) })));
    const references = await this.#references(source, fileSystem, selected, new Set(authored));
    for (const path of ["tsconfig.base.json", "packages/icons/tsconfig.json"]) {
      await fileSystem.readText(resolve(this.#workspaceRoot, path));
    }
    await source.verify();
    const proposal = {
      identity: selector,
      removalPath,
      inputs: source.inputs(),
      inventories: source.inventories(),
      absentPaths: source.absentPaths(),
      edits: Object.freeze(edits),
      generatedPaths,
      outputs,
      references,
      buildCommand: "pnpm --dir packages/icons run build",
      buildRoot: "packages/icons/dist",
    };
    const fingerprint = createHash("sha256").update(JSON.stringify(proposal)).digest("hex");
    return Object.freeze({ ...proposal, fingerprint });
  }

  /**
   * @description Requires explicit canonical slug sections without a default namespace or treatment.
   * @param {string} selector - Untrusted command selector.
   * @returns {void} Completion for a structurally canonical selector; discovery resolves exact existence.
   */
  #validateSelector(selector) {
    const pattern = new RegExp(catalogueSourceGeneration.slugPatternSource, "u");
    const parts = typeof selector === "string" ? selector.split("@") : [];
    const glyph = parts[0]?.split("/") ?? [];
    if (parts.length !== 2 || glyph.length < 1 || glyph.length > 2 || ![...glyph, parts[1]].every((part) => typeof part === "string" && pattern.test(part))) {
      throw new CatalogueSourceError("Removal requires one exact [namespace/]name@variant identity.");
    }
  }

  /**
   * @description Reports disclosed literal repository references without claiming exhaustive dependency detection.
   * @param {CatalogueIconRemovalSource} source - Current physical snapshot owner.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Read-only exact-text capability.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} selected - Selected icon.
   * @param {ReadonlySet<string>} authored - Canonical authored scope already inspected for blocking dependencies.
   * @returns {Promise<readonly import("../contracts/internal/catalogue-icon-removal-reference.contract.mjs").ICatalogueIconRemovalReference[]>} Ordered line-level review notices.
   */
  async #references(source, fileSystem, selected, authored) {
    const needles = [
      this.#keys.serialise(catalogueSourceFamilyKinds.icon, selected.manifest.identity),
      selected.exportName,
      `${selected.name}-${selected.variant}.icon.`,
      `@luscious-garden/aster-icons/${selected.name}/${selected.variant}`,
    ];
    const references = [];
    for (const root of ["packages", "tooling", "tests", "docs", "README.md"]) {
      for (const path of await source.files(root, (path) => /\.(?:ts|mjs|md)$/u.test(path))) {
        if (authored.has(path)) {
          continue;
        }
        const text = await fileSystem.readText(path);
        const lines = text.split(/\r?\n/u).flatMap((line, index) => needles.some((needle) => line.includes(needle)) ? [index + 1] : []);
        if (lines.length > 0) {
          references.push(Object.freeze({ path: source.display(path), lines: Object.freeze(lines) }));
        }
      }
    }
    return Object.freeze(references);
  }
}
