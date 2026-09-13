import ts from "typescript";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Validates canonical definition syntax, authored identity and collection membership.
 */
export class CatalogueSourceSyntaxInspector {
  /**
   * @description Validates one canonical source and returns imported collection member references.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {string} source - Exact TypeScript source.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @param {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} identity - Path-owned expected identity.
   * @returns {readonly import("../contracts/internal/catalogue-collection-member-reference.contract.mjs").ICatalogueCollectionMemberReference[]} Imported collection members.
   */
  inspect(sourcePath, source, family, identity) {
    const sourceFile = ts.createSourceFile(
      sourcePath,
      source,
      ts.ScriptTarget.ESNext,
      true,
      ts.ScriptKind.TS,
    );

    if (sourceFile.parseDiagnostics.length > 0) {
      throw new CatalogueSourceError(
        `Invalid TypeScript catalogue source: ${sourcePath}`,
      );
    }

    const declaration = this.#exportedConstant(
      sourcePath,
      sourceFile,
      identity.symbol,
    );
    const definition = this.#definitionObject(sourcePath, declaration, family);
    const identityObject = this.#requiredObjectProperty(
      sourcePath,
      definition,
      "identity",
    );
    const authoredName = this.#requiredStringProperty(
      sourcePath,
      identityObject,
      "name",
    );
    const authoredVariant = this.#optionalStringProperty(
      sourcePath,
      identityObject,
      "variant",
    );

    if (authoredName !== identity.name || authoredVariant !== identity.variant) {
      throw new CatalogueSourceError(
        `${sourcePath} identity must match ${this.#displayIdentity(identity)}.`,
      );
    }

    return family.kind === catalogueSourceFamilyKinds.collection
      ? this.#collectionMemberReferences(sourcePath, sourceFile, definition)
      : Object.freeze([]);
  }

  /**
   * @description Resolves exactly one exported constant declaration.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed TypeScript source.
   * @param {string} expectedSymbol - Required exported constant symbol.
   * @returns {import("typescript").VariableDeclaration} Canonical exported declaration.
   */
  #exportedConstant(sourcePath, sourceFile, expectedSymbol) {
    const declarations = [];

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
          declarations.push(declaration);
        }
      }
    }

    if (
      declarations.length !== 1 ||
      declarations[0].name.text !== expectedSymbol
    ) {
      throw new CatalogueSourceError(
        `${sourcePath} must export exactly one constant named ${expectedSymbol}.`,
      );
    }

    return declarations[0];
  }

  /**
   * @description Resolves the object passed to the configured public Core definition factory.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").VariableDeclaration} declaration - Canonical exported declaration.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Source-family configuration.
   * @returns {import("typescript").ObjectLiteralExpression} Authored definition object.
   */
  #definitionObject(sourcePath, declaration, family) {
    const initializer = declaration.initializer;

    if (
      initializer === undefined ||
      !ts.isCallExpression(initializer) ||
      initializer.arguments.length !== 1 ||
      !ts.isPropertyAccessExpression(initializer.expression) ||
      !ts.isIdentifier(initializer.expression.expression) ||
      initializer.expression.expression.text !== family.definitionFactory ||
      initializer.expression.name.text !== "define" ||
      !ts.isObjectLiteralExpression(initializer.arguments[0])
    ) {
      throw new CatalogueSourceError(
        `${sourcePath} must initialise ${family.definitionFactory}.define(...) with one object.`,
      );
    }

    return initializer.arguments[0];
  }

  /**
   * @description Resolves one required object-valued property without computed syntax.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Object containing the required property.
   * @param {string} name - Required property name.
   * @returns {import("typescript").ObjectLiteralExpression} Required object literal value.
   */
  #requiredObjectProperty(sourcePath, object, name) {
    const value = this.#propertyValue(sourcePath, object, name, true);

    if (!ts.isObjectLiteralExpression(value)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare ${name} as an object literal.`,
      );
    }

    return value;
  }

  /**
   * @description Resolves one required string-literal property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Object containing the required property.
   * @param {string} name - Required property name.
   * @returns {string} Exact authored string value.
   */
  #requiredStringProperty(sourcePath, object, name) {
    const value = this.#propertyValue(sourcePath, object, name, true);

    if (!ts.isStringLiteralLike(value)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare ${name} as a string literal.`,
      );
    }

    return value.text;
  }

  /**
   * @description Resolves one optional string-literal property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Object containing the optional property.
   * @param {string} name - Optional property name.
   * @returns {string | undefined} Exact authored string value when present.
   */
  #optionalStringProperty(sourcePath, object, name) {
    const value = this.#propertyValue(sourcePath, object, name, false);

    if (value === undefined) {
      return undefined;
    }

    if (!ts.isStringLiteralLike(value)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare ${name} as a string literal.`,
      );
    }

    return value.text;
  }

  /**
   * @description Resolves one unique direct property assignment.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Object containing the candidate property.
   * @param {string} name - Property name to resolve.
   * @param {boolean} required - Whether absence is invalid.
   * @returns {import("typescript").Expression | undefined} Direct property value when present.
   */
  #propertyValue(sourcePath, object, name, required) {
    const properties = object.properties.filter(
      (property) =>
        ts.isPropertyAssignment(property) &&
        ((ts.isIdentifier(property.name) && property.name.text === name) ||
          (ts.isStringLiteralLike(property.name) && property.name.text === name)),
    );

    if (properties.length > 1 || (required && properties.length === 0)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare exactly one ${name} property.`,
      );
    }

    return properties[0]?.initializer;
  }

  /**
   * @description Resolves collection members to their named import declarations.
   * @param {string} sourcePath - Absolute collection source path.
   * @param {import("typescript").SourceFile} sourceFile - Parsed TypeScript collection source.
   * @param {import("typescript").ObjectLiteralExpression} definition - Authored collection definition object.
   * @returns {readonly import("../contracts/internal/catalogue-collection-member-reference.contract.mjs").ICatalogueCollectionMemberReference[]} Frozen member references.
   */
  #collectionMemberReferences(sourcePath, sourceFile, definition) {
    const icons = this.#propertyValue(sourcePath, definition, "icons", true);

    if (!ts.isArrayLiteralExpression(icons)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare icons as an array literal.`,
      );
    }

    const imports = this.#namedImports(sourcePath, sourceFile);
    const references = [];
    const members = new Set();

    for (const member of icons.elements) {
      if (!ts.isIdentifier(member)) {
        throw new CatalogueSourceError(
          `${sourcePath} collection members must be imported identifiers.`,
        );
      }

      if (members.has(member.text)) {
        throw new CatalogueSourceError(
          `${sourcePath} contains duplicate collection member ${member.text}.`,
        );
      }

      const reference = imports.get(member.text);

      if (reference === undefined) {
        throw new CatalogueSourceError(
          `${sourcePath} collection member ${member.text} must use a named import.`,
        );
      }

      members.add(member.text);
      references.push(reference);
    }

    return Object.freeze(references);
  }

  /**
   * @description Indexes static named imports by their local source identifier.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed TypeScript source.
   * @returns {ReadonlyMap<string, import("../contracts/internal/catalogue-collection-member-reference.contract.mjs").ICatalogueCollectionMemberReference>} Named import records.
   */
  #namedImports(sourcePath, sourceFile) {
    const imports = new Map();

    for (const statement of sourceFile.statements) {
      if (
        !ts.isImportDeclaration(statement) ||
        !ts.isStringLiteralLike(statement.moduleSpecifier) ||
        statement.importClause === undefined ||
        statement.importClause.namedBindings === undefined ||
        !ts.isNamedImports(statement.importClause.namedBindings)
      ) {
        continue;
      }

      for (const element of statement.importClause.namedBindings.elements) {
        if (imports.has(element.name.text)) {
          throw new CatalogueSourceError(
            `${sourcePath} contains ambiguous named import ${element.name.text}.`,
          );
        }

        imports.set(
          element.name.text,
          Object.freeze({
            localSymbol: element.name.text,
            importedSymbol: element.propertyName?.text ?? element.name.text,
            moduleSpecifier: statement.moduleSpecifier.text,
          }),
        );
      }
    }

    return imports;
  }

  /**
   * @description Presents one logical identity in stable diagnostic form.
   * @param {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} identity - Logical identity to present.
   * @returns {string} Stable name and optional variant representation.
   */
  #displayIdentity(identity) {
    return identity.variant === undefined
      ? identity.name
      : `${identity.name}@${identity.variant}`;
  }
}
