import ts from "typescript";

import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Resolves a finite data-only subset of canonical TypeScript expressions without executing source modules.
 */
export class CatalogueSourceValueResolver {
  /** @description Canonical source text acquisition capability. */
  #fileSystem;

  /** @description Repository path composition capability. */
  #paths;

  /** @description Parsed imported source documents indexed by absolute path. */
  #documents = new Map();

  /** @description Resolved imported constant values indexed by absolute symbol identity. */
  #values = new Map();

  /**
   * @description Creates one static catalogue source value resolver.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Canonical source acquisition capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Clears data cached during the preceding complete source inspection.
   * @returns {void} Nothing.
   */
  reset() {
    this.#documents.clear();
    this.#values.clear();
  }

  /**
   * @description Resolves one accepted static expression to deeply immutable data.
   * @param {string} sourcePath - Absolute source path containing the expression.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document containing the expression.
   * @param {import("typescript").Expression} expression - Data-only expression to resolve.
   * @returns {Promise<unknown>} Deeply immutable resolved value.
   */
  async resolve(sourcePath, sourceFile, expression) {
    return this.#resolveExpression(
      sourcePath,
      sourceFile,
      this.#unwrap(expression),
      new Set(),
    );
  }

  /**
   * @description Resolves one expression through the accepted finite syntax subset.
   * @param {string} sourcePath - Absolute source path containing the expression.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document containing the expression.
   * @param {import("typescript").Expression} expression - Unwrapped expression to resolve.
   * @param {Set<string>} references - Imported constant identities active in the current resolution chain.
   * @returns {Promise<unknown>} Deeply immutable resolved value.
   */
  async #resolveExpression(sourcePath, sourceFile, expression, references) {
    if (ts.isStringLiteralLike(expression)) {
      return expression.text;
    }

    if (ts.isNumericLiteral(expression)) {
      return Number(expression.text);
    }

    if (expression.kind === ts.SyntaxKind.TrueKeyword) {
      return true;
    }

    if (expression.kind === ts.SyntaxKind.FalseKeyword) {
      return false;
    }

    if (expression.kind === ts.SyntaxKind.NullKeyword) {
      return null;
    }

    if (
      ts.isPrefixUnaryExpression(expression)
      && expression.operator === ts.SyntaxKind.MinusToken
      && ts.isNumericLiteral(expression.operand)
    ) {
      return -Number(expression.operand.text);
    }

    if (ts.isArrayLiteralExpression(expression)) {
      const values = [];

      for (const element of expression.elements) {
        if (ts.isSpreadElement(element) || ts.isOmittedExpression(element)) {
          this.#unsupported(sourcePath, expression);
        }

        values.push(
          await this.#resolveExpression(
            sourcePath,
            sourceFile,
            this.#unwrap(element),
            references,
          ),
        );
      }

      return Object.freeze(values);
    }

    if (ts.isObjectLiteralExpression(expression)) {
      const value = Object.create(null);

      for (const property of expression.properties) {
        if (!ts.isPropertyAssignment(property)) {
          this.#unsupported(sourcePath, expression);
        }

        const name = this.#propertyName(sourcePath, property.name);

        if (Object.hasOwn(value, name)) {
          throw new CatalogueSourceError(
            `${sourcePath} contains duplicate static property ${name}.`,
          );
        }

        value[name] = await this.#resolveExpression(
          sourcePath,
          sourceFile,
          this.#unwrap(property.initializer),
          references,
        );
      }

      return Object.freeze(value);
    }

    if (ts.isPropertyAccessExpression(expression)) {
      const owner = await this.#resolveExpression(
        sourcePath,
        sourceFile,
        this.#unwrap(expression.expression),
        references,
      );

      if (
        typeof owner !== "object"
        || owner === null
        || !Object.hasOwn(owner, expression.name.text)
      ) {
        throw new CatalogueSourceError(
          `${sourcePath} references an unavailable static property ${expression.name.text}.`,
        );
      }

      return owner[expression.name.text];
    }

    if (ts.isIdentifier(expression)) {
      return this.#resolveIdentifier(
        sourcePath,
        sourceFile,
        expression.text,
        references,
      );
    }

    if (
      ts.isCallExpression(expression)
      && expression.arguments.length === 1
      && ts.isPropertyAccessExpression(expression.expression)
      && ts.isIdentifier(expression.expression.expression)
      && expression.expression.expression.text === "Object"
      && expression.expression.name.text === "freeze"
    ) {
      return this.#resolveExpression(
        sourcePath,
        sourceFile,
        this.#unwrap(expression.arguments[0]),
        references,
      );
    }

    return this.#unsupported(sourcePath, expression);
  }

  /**
   * @description Resolves one local or named-imported constant identifier.
   * @param {string} sourcePath - Absolute source path containing the identifier.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document containing the identifier.
   * @param {string} name - Local identifier name.
   * @param {Set<string>} references - Imported constant identities active in the current resolution chain.
   * @returns {Promise<unknown>} Resolved immutable constant value.
   */
  async #resolveIdentifier(sourcePath, sourceFile, name, references) {
    const reference = `${sourcePath}#${name}`;

    if (this.#values.has(reference)) {
      return this.#values.get(reference);
    }

    if (references.has(reference)) {
      throw new CatalogueSourceError(
        `${sourcePath} contains a cyclic static catalogue reference through ${name}.`,
      );
    }

    references.add(reference);

    try {
      const local = this.#constantDeclaration(sourcePath, sourceFile, name);

      if (local !== undefined) {
        const value = await this.#resolveExpression(
          sourcePath,
          sourceFile,
          this.#unwrap(local.initializer),
          references,
        );
        this.#values.set(reference, value);
        return value;
      }

      const binding = this.#importBinding(sourcePath, sourceFile, name);

      if (binding === undefined || !/^(?:\.\/|\.\.\/)/u.test(binding.specifier)) {
        throw new CatalogueSourceError(
          `${sourcePath} references unsupported static identifier ${name}.`,
        );
      }

      const targetPath = this.#paths.resolve(
        this.#paths.dirname(sourcePath),
        binding.specifier.replace(/\.js$/u, ".ts"),
      );
      const target = await this.#document(targetPath);
      const declaration = this.#constantDeclaration(
        targetPath,
        target.sourceFile,
        binding.importedName,
        true,
      );

      if (declaration === undefined) {
        throw new CatalogueSourceError(
          `${sourcePath} cannot resolve static import ${binding.importedName} from ${binding.specifier}.`,
        );
      }

      const value = await this.#resolveIdentifier(
        targetPath,
        target.sourceFile,
        binding.importedName,
        references,
      );
      this.#values.set(reference, value);
      return value;
    } finally {
      references.delete(reference);
    }
  }

  /**
   * @description Acquires and parses one imported TypeScript source document once.
   * @param {string} sourcePath - Absolute imported source path.
   * @returns {Promise<{ sourceFile: import("typescript").SourceFile }>} Parsed source document.
   */
  async #document(sourcePath) {
    if (this.#documents.has(sourcePath)) {
      return this.#documents.get(sourcePath);
    }

    const source = await this.#fileSystem.readText(sourcePath);
    const sourceFile = ts.createSourceFile(
      sourcePath,
      source,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TS,
    );

    if (sourceFile.parseDiagnostics.length > 0) {
      throw new CatalogueSourceError(
        `Invalid TypeScript static catalogue source: ${sourcePath}`,
      );
    }

    const document = Object.freeze({ sourceFile });
    this.#documents.set(sourcePath, document);
    return document;
  }

  /**
   * @description Finds one directly initialised top-level constant declaration.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {string} name - Constant identifier to find.
   * @param {boolean} [exported=false] - Whether the declaration must be exported.
   * @returns {import("typescript").VariableDeclaration | undefined} Matching initialised constant.
   */
  #constantDeclaration(sourcePath, sourceFile, name, exported = false) {
    const declarations = [];

    for (const statement of sourceFile.statements) {
      if (
        !ts.isVariableStatement(statement)
        || (statement.declarationList.flags & ts.NodeFlags.Const) === 0
        || (exported && !statement.modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        ))
      ) {
        continue;
      }

      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name)
          && declaration.name.text === name
          && declaration.initializer !== undefined
        ) {
          declarations.push(declaration);
        }
      }
    }

    if (declarations.length > 1) {
      throw new CatalogueSourceError(
        `${sourcePath} contains ambiguous static constant ${name}.`,
      );
    }

    return declarations[0];
  }

  /**
   * @description Finds one named import binding by its local identifier.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {string} localName - Local import identifier.
   * @returns {{ importedName: string, specifier: string } | undefined} Static named import binding.
   */
  #importBinding(sourcePath, sourceFile, localName) {
    const bindings = [];

    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement)
        || !ts.isStringLiteralLike(statement.moduleSpecifier)
        || statement.importClause?.isTypeOnly
        || statement.importClause?.namedBindings === undefined
        || !ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        continue;
      }

      for (const element of statement.importClause.namedBindings.elements) {
        if (element.isTypeOnly) {
          continue;
        }

        if (element.name.text === localName) {
          bindings.push(Object.freeze({
            importedName: element.propertyName?.text ?? element.name.text,
            specifier: statement.moduleSpecifier.text,
          }));
        }
      }
    }

    if (bindings.length > 1) {
      throw new CatalogueSourceError(
        `${sourcePath} contains ambiguous static import ${localName}.`,
      );
    }

    return bindings[0];
  }

  /**
   * @description Resolves one direct object-literal property name.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").PropertyName} propertyName - Candidate property name.
   * @returns {string} Static property name.
   */
  #propertyName(sourcePath, propertyName) {
    if (ts.isIdentifier(propertyName) || ts.isStringLiteralLike(propertyName)) {
      return propertyName.text;
    }

    throw new CatalogueSourceError(
      `${sourcePath} contains an unsupported computed static property.`,
    );
  }

  /**
   * @description Removes syntax-only wrappers from one expression.
   * @param {import("typescript").Expression} expression - Candidate wrapped expression.
   * @returns {import("typescript").Expression} Innermost runtime expression.
   */
  #unwrap(expression) {
    let current = expression;

    while (
      ts.isParenthesizedExpression(current)
      || ts.isAsExpression(current)
      || ts.isSatisfiesExpression(current)
      || ts.isNonNullExpression(current)
    ) {
      current = current.expression;
    }

    return current;
  }

  /**
   * @description Rejects syntax that would require source execution or ambiguous evaluation.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").Node} node - Unsupported syntax node.
   * @returns {never} Always throws one stable catalogue source error.
   */
  #unsupported(sourcePath, node) {
    throw new CatalogueSourceError(
      `${sourcePath} contains unsupported static catalogue syntax ${ts.SyntaxKind[node.kind]}.`,
    );
  }
}
