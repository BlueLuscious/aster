import ts from "typescript";
import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Derives treatment export patterns and edits only their reserved package-manifest properties.
 */
export class CatalogueSourceExportsPlanner {
  /** @description Manifest acquisition capability. */
  #fileSystem;
  /** @description Package path composition capability. */
  #paths;
  /** @description Shared facade layout and emitted target authority. */
  #facades;

  /**
   * @description Composes partial export planning without another editable treatment catalogue.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Manifest acquisition capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Path composition capability.
   * @param {import("./catalogue-source-facade.resolver.mjs").CatalogueSourceFacadeResolver} facades - Canonical facade layout.
   */
  constructor(fileSystem, paths, facades) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
    this.#facades = facades;
  }

  /**
   * @description Plans a strict JSON edit while preserving manual property text and rejecting ambiguous ownership.
   * @param {string} packageRoot - Absolute owning package root.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Validated source inspections.
   * @returns {Promise<import("../contracts/internal/catalogue-source-package-edit.contract.mjs").ICatalogueSourcePackageEdit | undefined>} Manifest edit, or undefined when its owned entries already match.
   */
  async plan(packageRoot, inspections) {
    const path = this.#paths.resolve(packageRoot, "package.json");
    const interrupted = (await this.#fileSystem.entries(packageRoot)).find(({name}) =>
      name.startsWith("package.json.stage-") || name.startsWith("package.json.backup-"),
    );
    if (interrupted) {
      throw new CatalogueSourceError(`Interrupted or concurrent package publication requires inspection: ${interrupted.name}`);
    }
    const before = await this.#fileSystem.readText(path);
    try {
      JSON.parse(before.replace(/^\uFEFF/u, ""));
    } catch {
      throw new CatalogueSourceError("The package manifest must contain strict JSON.");
    }
    const document = ts.parseJsonText(path, before);
    const statement = document.statements[0];
    if (!statement || !ts.isExpressionStatement(statement) || !ts.isObjectLiteralExpression(statement.expression)) {
      throw new CatalogueSourceError("The package manifest must be an object.");
    }
    this.#validateProperties(statement.expression);
    const exportProperty = statement.expression.properties.find((property) =>
      ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name) && property.name.text === "exports",
    );
    if (!exportProperty || !ts.isPropertyAssignment(exportProperty) || !ts.isObjectLiteralExpression(exportProperty.initializer)) {
      throw new CatalogueSourceError("The package manifest must declare an exports object.");
    }
    const exports = exportProperty.initializer;
    const icons = inspections.find(({family}) => family.kind === catalogueSourceFamilyKinds.icon);
    if (!icons) {
      throw new CatalogueSourceError("Export planning requires an inspected icon family.");
    }
    const treatmentSet = new Set();
    const glyphRoutes = new Set();
    for (const module of icons.modules) {
      if (module.variant === undefined) {
        throw new CatalogueSourceError("Export planning requires explicit icon treatments.");
      }
      treatmentSet.add(module.variant);
      glyphRoutes.add(`./${module.name}`);
    }
    const treatments = [...treatmentSet].sort();
    const variantPattern = new RegExp(catalogueSourceGeneration.slugPatternSource, "u");
    const newline = before.includes("\r\n") ? "\r\n" : "\n";
    const first = exports.properties[0];
    const position = first?.getStart(document) ?? exportProperty.getStart(document);
    const leading = before.slice(before.lastIndexOf("\n", position) + 1, position);
    const indent = /^\s*$/u.test(leading) ? leading : "    ";
    const manual = exports.properties.filter((property) => {
      if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name)) {
        throw new CatalogueSourceError("Package exports require string property names.");
      }
      const key = property.name.text;
      if (key !== "./*" && !key.startsWith("./*/")) {
        if (key.includes("*") && key !== "./collections/*") {
          throw new CatalogueSourceError(`Conflicting manual export pattern: ${key}`);
        }
        if (/^\.\/[^/]+\//u.test(key) && !key.startsWith("./collections/")) {
          throw new CatalogueSourceError(`Manual export shadows a generated treatment route: ${key}`);
        }
        if (glyphRoutes.has(key)) {
          throw new CatalogueSourceError(`Manual export shadows a generated glyph route: ${key}`);
        }
        return true;
      }
      const variant = key === "./*" ? undefined : key.slice(4);
      if (variant !== undefined && !variantPattern.test(variant)) {
        throw new CatalogueSourceError(`Invalid owned treatment export: ${key}`);
      }
      const actual = property.initializer;
      const expected = this.#facades.exportTarget(icons.family, variant);
      const legacy = { types: "./dist/generated/facades/icons/*.d.ts", import: "./dist/generated/facades/icons/*.js" };
      if (!this.#matches(actual, expected) && !(key === "./*" && this.#matches(actual, legacy))) {
        throw new CatalogueSourceError(`Conflicting owned export target: ${key}`);
      }
      return false;
    }).map((property) => before.slice(property.getFullStart(), property.end));
    const owned = treatments.map((variant) => this.#entry(`./*/${variant}`, this.#facades.exportTarget(icons.family, variant), indent, newline));
    owned.push(this.#entry("./*", this.#facades.exportTarget(icons.family, undefined), indent, newline));
    const last = exports.properties.at(-1);
    const closing = before.slice(last?.end ?? exports.getStart(document) + 1, exports.end - 1);
    const start = exports.getStart(document) + 1;
    const end = exports.end - 1;
    const body = [...manual, ...owned].join(",") + closing;
    if (body === before.slice(start, end)) {
      return undefined;
    }
    const content = before.slice(0, start) + body + before.slice(end);
    return Object.freeze({
      output: Object.freeze({ path, relativePath: "package.json", content }),
      expectedContent: before,
    });
  }

  /**
   * @description Rejects duplicate JSON properties before any value can be silently shadowed.
   * @param {import("typescript").Node} node - Parsed JSON subtree.
   * @returns {void} Completion after object keys are unambiguous.
   */
  #validateProperties(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const keys = new Set();
      for (const property of node.properties) {
        if (!ts.isPropertyAssignment(property) || !ts.isStringLiteral(property.name)) {
          throw new CatalogueSourceError("Package JSON requires string property names.");
        }
        if (keys.has(property.name.text)) {
          throw new CatalogueSourceError(`Duplicate package JSON property: ${property.name.text}`);
        }
        keys.add(property.name.text);
      }
    }
    ts.forEachChild(node, (child) => this.#validateProperties(child));
  }

  /**
   * @description Compares the parsed own target properties without reparsing text or accepting extra export conditions.
   * @param {import("typescript").Expression} node - Target from the already validated strict JSON document.
   * @param {Readonly<{types: string, import: string}>} expected - Canonical target.
   * @returns {boolean} Whether the target has precisely the owned conditions and values.
   */
  #matches(node, expected) {
    return ts.isObjectLiteralExpression(node) && node.properties.length === 2
      && node.properties.every((property) =>
        ts.isPropertyAssignment(property) && ts.isStringLiteral(property.name)
        && ts.isStringLiteral(property.initializer)
        && ((property.name.text === "types" && property.initializer.text === expected.types)
          || (property.name.text === "import" && property.initializer.text === expected.import)),
      );
  }

  /**
   * @description Serialises one owned entry with the manifest's line endings and indentation.
   * @param {string} key - Owned export pattern.
   * @param {Readonly<{types: string, import: string}>} target - Canonical target.
   * @param {string} indent - Existing export-property indentation.
   * @param {string} newline - Existing line ending.
   * @returns {string} Complete owned property text, excluding its separating comma.
   */
  #entry(key, target, indent, newline) {
    return `${newline}${indent}${JSON.stringify(key)}: ${JSON.stringify(target, null, 2).replaceAll("\n", `${newline}${indent}`)}`;
  }
}
