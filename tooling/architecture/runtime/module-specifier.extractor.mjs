import ts from "typescript";

/**
 * @description Extracts statically recognisable module specifiers from source text.
 */
export class ModuleSpecifierExtractor {
  /**
   * @description Extracts literal imports, re-exports and import types in parsed source order without executing code.
   * @remarks Computed specifiers remain outside static inspection; comments, strings and regular expressions are not module references.
   * @param {string} source - TypeScript or JavaScript module source.
   * @param {string} [fileName] - Source path used to select TypeScript or JavaScript syntax.
   * @returns {readonly string[]} Recognised module specifiers.
   */
  extract(source, fileName = "module.ts") {
    const document = ts.createSourceFile(fileName, source, {
      languageVersion: ts.ScriptTarget.Latest,
      jsDocParsingMode: ts.JSDocParsingMode.ParseNone,
    });
    /** @type {string[]} */
    const specifiers = [];
    this.#visit(document, specifiers);
    return Object.freeze(specifiers);
  }

  /**
   * @description Visits syntax-owned module references in textual order.
   * @param {import("typescript").Node} node - Current syntax node.
   * @param {string[]} specifiers - Operation-local ordered module references.
   * @returns {void} Nothing after collecting this subtree.
   */
  #visit(node, specifiers) {
    let expression;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      expression = node.moduleSpecifier;
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      expression = node.arguments[0];
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      expression = node.argument.literal;
    } else if (ts.isExternalModuleReference(node)) {
      expression = node.expression;
    }

    while (expression !== undefined && (
      ts.isParenthesizedExpression(expression) || ts.isAsExpression(expression)
      || ts.isSatisfiesExpression(expression) || ts.isNonNullExpression(expression)
    )) {
      expression = expression.expression;
    }
    if (expression !== undefined && ts.isStringLiteralLike(expression)) {
      specifiers.push(expression.text);
    }
    ts.forEachChild(node, (child) => this.#visit(child, specifiers));
  }
}
