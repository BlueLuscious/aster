import ts from "typescript";

import { repositoryEntryKinds } from "../../shared/constants/repository-entry-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Discovers and validates direct canonical catalogue source modules.
 */
export class CatalogueSourceModuleInspector {
  /**
   * @description Canonical lowercase source slug grammar.
   */
  static #slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

  /** @type {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} */
  #fileSystem;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates one canonical source-module inspector.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Source acquisition capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Discovers one configured family and validates each expected exported constant.
   * @param {string} packageRoot - Absolute package root.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Canonical source-family configuration.
   * @returns {Promise<readonly import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule[]>} Canonically ordered source modules.
   */
  async inspect(packageRoot, family) {
    const sourceRoot = this.#paths.resolve(
      packageRoot,
      family.sourceDirectory,
    );
    const entries = (await this.#fileSystem.entries(sourceRoot))
      .filter(
        (entry) =>
          entry.kind === repositoryEntryKinds.file &&
          entry.name.endsWith(family.sourceSuffix),
      )
      .sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
      );
    const modules = [];
    const symbols = new Set();

    for (const entry of entries) {
      const slug = entry.name.slice(0, -family.sourceSuffix.length);

      if (!CatalogueSourceModuleInspector.#slugPattern.test(slug)) {
        throw new CatalogueSourceError(
          `Invalid canonical catalogue source filename: ${entry.name}`,
        );
      }

      const symbol = `${this.#pascalCase(slug)}${family.symbolSuffix}`;
      const sourcePath = this.#paths.resolve(sourceRoot, entry.name);
      const source = await this.#fileSystem.readText(sourcePath);
      this.#assertExportedConstant(sourcePath, source, symbol);

      if (symbol === family.authorityName || symbols.has(symbol)) {
        throw new CatalogueSourceError(
          `Ambiguous canonical catalogue source symbol: ${symbol}`,
        );
      }

      symbols.add(symbol);
      modules.push(Object.freeze({ slug, symbol }));
    }

    if (modules.length === 0) {
      throw new CatalogueSourceError(
        `Catalogue source family contains no ${family.sourceSuffix} modules.`,
      );
    }

    return Object.freeze(modules);
  }

  /**
   * @description Converts one canonical kebab-case slug to its expected PascalCase symbol.
   * @param {string} slug - Valid canonical source slug.
   * @returns {string} Expected source export symbol stem.
   */
  #pascalCase(slug) {
    return slug
      .split("-")
      .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
      .join("");
  }

  /**
   * @description Requires exactly one exported constant matching the filename-owned symbol.
   * @param {string} sourcePath - Source path used for stable failure context.
   * @param {string} source - Exact TypeScript source.
   * @param {string} expectedSymbol - Filename-derived canonical export symbol.
   * @returns {void}
   */
  #assertExportedConstant(sourcePath, source, expectedSymbol) {
    const sourceFile = ts.createSourceFile(
      sourcePath,
      source,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TS,
    );
    const exportedConstants = [];

    if (sourceFile.parseDiagnostics.length > 0) {
      throw new CatalogueSourceError(
        `Invalid TypeScript catalogue source: ${sourcePath}`,
      );
    }

    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) {
        continue;
      }

      const exported = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      );
      const constant = (statement.declarationList.flags & ts.NodeFlags.Const) !== 0;

      if (!exported || !constant) {
        continue;
      }

      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          exportedConstants.push(declaration.name.text);
        }
      }
    }

    if (
      exportedConstants.length !== 1 ||
      exportedConstants[0] !== expectedSymbol
    ) {
      throw new CatalogueSourceError(
        `${sourcePath} must export exactly one constant named ${expectedSymbol}.`,
      );
    }
  }
}
