import { dirname, resolve } from "node:path";
import ts from "typescript";

import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans exact membership/import deletions without reprinting authored TypeScript.
 * @remarks Ambiguous identifier uses or comment ownership are rejected rather than reassociated. Static catalogue validation remains the grammar authority.
 */
export class CatalogueIconRemovalEditor {
  /**
   * @description Rejects authored dependencies on a selected module outside editable collections.
   * @param {string} sourcePath - Absolute authored source path.
   * @param {string} source - Exact source text.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} selected - Validated selected icon.
   * @returns {void} Completion when no direct dependency is found.
   */
  rejectDependencies(sourcePath, source, selected) {
    this.#dependencies(this.#parse(sourcePath, source), selected, new Set());
  }

  /**
   * @description Plans one collection's selected memberships and the import made unused by them.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} collection - Validated collection references.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} selected - Exact icon to remove.
   * @param {string} source - Exact acquired collection text.
   * @param {string} displayPath - Workspace-relative collection path.
   * @returns {import("../contracts/internal/catalogue-icon-removal-edit.contract.mjs").ICatalogueIconRemovalEdit | undefined} Immutable edit, or no membership/dependency.
   */
  plan(collection, selected, source, displayPath) {
    const file = this.#parse(collection.sourcePath, source);
    const references = collection.memberReferences.filter((reference) => this.#targets(collection.sourcePath, reference.moduleSpecifier, selected));
    if (references.length === 0) {
      this.#dependencies(file, selected, new Set());
      return undefined;
    }
    const icons = this.#icons(file, collection.exportName);
    const changes = [];
    const aliases = [];
    /** @type {Set<import("typescript").Node>} */
    const allowed = new Set();
    const identifiers = new Set();
    for (const reference of references) {
      const outer = icons.properties.find((node) => ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === reference.alias);
      if (outer === undefined || !ts.isPropertyAssignment(outer) || !ts.isObjectLiteralExpression(outer.initializer)) {
        throw new CatalogueSourceError(`Unresolved removal membership in ${displayPath}.`);
      }
      const group = outer.initializer;
      const member = group.properties.find((node) => ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) && node.name.text === reference.variantPropertyName);
      if (member === undefined || !ts.isPropertyAssignment(member) || !ts.isIdentifier(member.initializer) || member.initializer.text !== reference.localSymbol) {
        throw new CatalogueSourceError(`Unresolved removal treatment in ${displayPath}.`);
      }
      allowed.add(member.initializer);
      identifiers.add(reference.localSymbol);
      aliases.push(reference.alias);
      changes.push(this.#deletion(file, group.properties.length === 1 ? outer : member, group.properties.length === 1 ? icons.properties : group.properties));
    }
    for (const statement of file.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteralLike(statement.moduleSpecifier) || !this.#targets(file.fileName, statement.moduleSpecifier.text, selected)) {
        continue;
      }
      const clause = statement.importClause;
      const bindings = clause?.namedBindings;
      if (clause === undefined || clause.isTypeOnly || clause.name !== undefined || bindings === undefined || !ts.isNamedImports(bindings) || statement.attributes !== undefined || bindings.elements.length !== 1) {
        throw new CatalogueSourceError(`Other import bindings would reference the removed module in ${displayPath}.`);
      }
      const binding = bindings.elements[0];
      if (binding === undefined || binding.isTypeOnly || !identifiers.has(binding.name.text) || (binding.propertyName?.text ?? binding.name.text) !== selected.exportName) {
        throw new CatalogueSourceError(`Unsupported removal import in ${displayPath}.`);
      }
      allowed.add(binding.name);
      if (binding.propertyName !== undefined) {
        allowed.add(binding.propertyName);
      }
      allowed.add(statement.moduleSpecifier);
      changes.push(this.#deletion(file, statement));
    }
    const visit = (/** @type {import("typescript").Node} */ node) => {
      if (ts.isIdentifier(node) && identifiers.has(node.text) && !allowed.has(node)) {
        throw new CatalogueSourceError(`Selected binding is used outside removable memberships in ${displayPath}: ${node.text}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    this.#dependencies(file, selected, allowed);
    changes.sort((a, b) => a.start - b.start);
    let after = source;
    let boundary = source.length;
    for (const change of [...changes].reverse()) {
      if (change.end > boundary) {
        throw new CatalogueSourceError(`Overlapping removal edits in ${displayPath}.`);
      }
      after = after.slice(0, change.start) + after.slice(change.end);
      boundary = change.start;
    }
    return Object.freeze({
      path: displayPath,
      before: source,
      after,
      changes: Object.freeze(changes),
      aliases: Object.freeze(aliases),
      empty: references.length === collection.memberReferences.length,
    });
  }

  /**
   * @description Parses a source without executing it or accepting parser recovery.
   * @param {string} path - Source filename.
   * @param {string} source - Exact TypeScript text.
   * @returns {import("typescript").SourceFile} Accepted syntax tree.
   */
  #parse(path, source) {
    const file = /** @type {import("typescript").SourceFile & { parseDiagnostics: readonly import("typescript").Diagnostic[] }} */ (ts.createSourceFile(path, source, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS));
    if (file.parseDiagnostics.length > 0) {
      throw new CatalogueSourceError(`Invalid TypeScript removal input: ${path}`);
    }
    return file;
  }

  /**
   * @description Finds the already validated exported collection's literal membership object.
   * @param {import("typescript").SourceFile} file - Validated collection syntax.
   * @param {string} exportName - Expected canonical export.
   * @returns {import("typescript").ObjectLiteralExpression} Direct icons object.
   */
  #icons(file, exportName) {
    for (const statement of file.statements) {
      if (!ts.isVariableStatement(statement)) {
        continue;
      }
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || declaration.name.text !== exportName || declaration.initializer === undefined || !ts.isCallExpression(declaration.initializer)) {
          continue;
        }
        const argument = declaration.initializer.arguments[0];
        if (argument !== undefined && ts.isObjectLiteralExpression(argument)) {
          for (const node of argument.properties) {
            if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name)) && node.name.text === "icons" && ts.isObjectLiteralExpression(node.initializer)) {
              return node.initializer;
            }
          }
        }
      }
    }
    throw new CatalogueSourceError(`Unresolved collection object: ${file.fileName}`);
  }

  /**
   * @description Recognises exact canonical-file and public-leaf dependencies without basename guessing.
   * @param {string} sourcePath - Importing source.
   * @param {string} specifier - Literal candidate specifier.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} selected - Selected icon.
   * @returns {boolean} Whether the literal targets the selected definition.
   */
  #targets(sourcePath, specifier, selected) {
    if (specifier === `@luscious-garden/aster-icons/${selected.name}/${selected.variant}`) {
      return true;
    }
    return /^(?:\.\/|\.\.\/)/u.test(specifier) && resolve(dirname(sourcePath), specifier.replace(/\.js$/u, ".ts")) === selected.sourcePath;
  }

  /**
   * @description Rejects direct literal dependencies except exact membership imports being removed.
   * @param {import("typescript").SourceFile} file - Authored source tree.
   * @param {import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule} selected - Selected icon.
   * @param {ReadonlySet<import("typescript").Node>} allowed - Exact removable literal nodes.
   * @returns {void} Completion when no other literal reference exists.
   */
  #dependencies(file, selected, allowed) {
    const visit = (/** @type {import("typescript").Node} */ node) => {
      if (ts.isStringLiteralLike(node) && this.#targets(file.fileName, node.text, selected) && !allowed.has(node)) {
        throw new CatalogueSourceError(`Authored source depends on the removed icon outside supported membership: ${file.fileName}`);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }

  /**
   * @description Determines whether a token range includes comments rather than only source syntax.
   * @param {string} text - Exact source range.
   * @returns {boolean} Whether comment ownership needs human review.
   */
  #comments(text) {
    const scanner = ts.createScanner(ts.ScriptTarget.ESNext, false, ts.LanguageVariant.Standard, text);
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
      if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
        return true;
      }
    }
    return false;
  }

  /**
   * @description Selects one syntax item and its owned separator/line without consuming neighbouring text.
   * @param {import("typescript").SourceFile} file - Original parsed source.
   * @param {import("typescript").Node} node - Selected membership, group or import.
   * @param {readonly import("typescript").Node[]} [siblings] - Literal list owning comma separators.
   * @returns {import("../contracts/internal/catalogue-icon-removal-change.contract.mjs").ICatalogueIconRemovalChange} Exact deletion span.
   */
  #deletion(file, node, siblings) {
    const source = file.text;
    let start = node.getStart(file);
    let end = node.end;
    if (this.#comments(source.slice(node.getFullStart(), end))) {
      throw new CatalogueSourceError(`Removal has ambiguous comment ownership: ${file.fileName}`);
    }
    if (siblings !== undefined) {
      const index = siblings.indexOf(node);
      const next = siblings[index + 1];
      const limit = next?.getStart(file) ?? node.parent.end - 1;
      const suffix = source.slice(end, limit);
      const comma = /^\s*,/u.exec(suffix);
      if (comma !== null) {
        end += comma[0].length;
        while (source[end] === " " || source[end] === "\t") {
          end++;
        }
      } else if (index > 0) {
        const previous = siblings[index - 1];
        if (previous === undefined) {
          throw new CatalogueSourceError("Unresolved removal separator.");
        }
        const prefix = source.slice(previous.end, start);
        if (!/^\s*,\s*$/u.test(prefix)) {
          throw new CatalogueSourceError(`Removal has an unsupported separator: ${file.fileName}`);
        }
        start = previous.end + prefix.indexOf(",");
      }
    }
    let lineStart = source.lastIndexOf("\n", start - 1) + 1;
    if (lineStart === 0 && source.startsWith("\uFEFF")) {
      lineStart = 1;
    }
    const newline = source.indexOf("\n", end);
    const lineEnd = newline === -1 ? source.length : newline;
    if (this.#comments(source.slice(end, lineEnd))) {
      throw new CatalogueSourceError(`Removal has ambiguous trailing comments: ${file.fileName}`);
    }
    if (source.slice(lineStart, start).trim() === "" && source.slice(end, lineEnd).trim() === "") {
      start = lineStart;
      end = newline === -1 ? lineEnd : newline + 1;
    }
    return Object.freeze({ start, end, removedText: source.slice(start, end) });
  }
}
