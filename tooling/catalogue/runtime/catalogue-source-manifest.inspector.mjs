import ts from "typescript";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Extracts validated metadata-only distribution data from canonical definition syntax.
 */
export class CatalogueSourceManifestInspector {
  /** @description Static TypeScript data resolution capability. */
  #values;

  /**
   * @description Creates one metadata-only canonical source inspector.
   * @param {import("./catalogue-source-value.resolver.mjs").CatalogueSourceValueResolver} values - Static TypeScript data resolver.
   */
  constructor(values) {
    this.#values = values;
  }

  /**
   * @description Starts one fresh complete source inspection lifecycle.
   * @returns {void} Nothing.
   */
  reset() {
    this.#values.reset();
  }

  /**
   * @description Extracts one icon or collection manifest datum without evaluating its definition.
   * @param {string} sourcePath - Absolute canonical source path.
   * @param {import("typescript").SourceFile} sourceFile - Parsed canonical source document.
   * @param {import("typescript").ObjectLiteralExpression} definition - Direct definition factory object.
   * @param {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} identity - Path-owned canonical identity.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Canonical source-family configuration.
   * @returns {Promise<import("../contracts/internal/catalogue-icon-manifest-data.contract.mjs").ICatalogueIconManifestData | import("../contracts/internal/catalogue-collection-manifest-data.contract.mjs").ICatalogueCollectionManifestData>} Frozen metadata-only source data.
   */
  async inspect(sourcePath, sourceFile, definition, identity, family) {
    const identityObject = this.#requiredObjectProperty(
      sourcePath,
      definition,
      "identity",
    );
    const namespace = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      identityObject,
      "namespace",
    );
    const portableIdentity = this.#identity(identity, namespace, family.kind);
    const metadata = this.#requiredObjectProperty(
      sourcePath,
      definition,
      "metadata",
    );

    return family.kind === catalogueSourceFamilyKinds.icon
      ? this.#icon(sourcePath, sourceFile, portableIdentity, metadata)
      : this.#collection(sourcePath, sourceFile, portableIdentity, metadata);
  }

  /**
   * @description Extracts one icon manifest datum from accepted definition metadata.
   * @param {string} sourcePath - Absolute canonical icon source path.
   * @param {import("typescript").SourceFile} sourceFile - Parsed canonical source document.
   * @param {{ namespace?: string, name: string, variant?: string }} identity - Complete portable icon identity.
   * @param {import("typescript").ObjectLiteralExpression} metadata - Direct icon metadata object.
   * @returns {Promise<import("../contracts/internal/catalogue-icon-manifest-data.contract.mjs").ICatalogueIconManifestData>} Frozen icon manifest data.
   */
  async #icon(sourcePath, sourceFile, identity, metadata) {
    const displayName = await this.#requiredStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "displayName",
    );
    const tags = await this.#optionalTagsProperty(
      sourcePath,
      sourceFile,
      metadata,
      "tags",
    );
    const rtl = await this.#requiredStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "rtl",
    );
    const licence = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "licence",
    );
    const attribution = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "attribution",
    );
    const deprecated = await this.#requiredBooleanProperty(
      sourcePath,
      sourceFile,
      metadata,
      "deprecated",
    );
    const replacedByValue = await this.#resolvedProperty(
      sourcePath,
      sourceFile,
      metadata,
      "replacedBy",
      false,
    );
    const replacedBy = replacedByValue === undefined
      ? undefined
      : this.#resolvedIconIdentity(sourcePath, replacedByValue, "replacedBy");

    return Object.freeze({
      identity,
      displayName,
      tags,
      rtl,
      licence,
      attribution,
      deprecated,
      replacedBy,
    });
  }

  /**
   * @description Extracts one collection manifest datum from accepted definition metadata.
   * @param {string} sourcePath - Absolute canonical collection source path.
   * @param {import("typescript").SourceFile} sourceFile - Parsed canonical source document.
   * @param {{ namespace?: string, name: string }} identity - Complete portable collection identity.
   * @param {import("typescript").ObjectLiteralExpression} metadata - Direct collection metadata object.
   * @returns {Promise<import("../contracts/internal/catalogue-collection-manifest-data.contract.mjs").ICatalogueCollectionManifestData>} Frozen collection manifest data.
   */
  async #collection(sourcePath, sourceFile, identity, metadata) {
    const displayName = await this.#requiredStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "displayName",
    );
    const description = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "description",
    );
    const tags = await this.#optionalTagsProperty(
      sourcePath,
      sourceFile,
      metadata,
      "tags",
    );
    const licence = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "licence",
    );
    const attribution = await this.#optionalStringProperty(
      sourcePath,
      sourceFile,
      metadata,
      "attribution",
    );

    return Object.freeze({
      identity,
      metadata: Object.freeze({
        displayName,
        description,
        tags,
        licence,
        attribution,
      }),
    });
  }

  /**
   * @description Constructs one immutable portable identity from path and optional namespace data.
   * @param {import("../contracts/internal/catalogue-source-identity.contract.mjs").ICatalogueSourceIdentity} identity - Path-owned canonical identity.
   * @param {string | undefined} namespace - Optional resolved namespace.
   * @param {"icon" | "collection"} familyKind - Semantic source-family discriminator.
   * @returns {{ namespace?: string, name: string, variant?: string }} Frozen portable identity.
   */
  #identity(identity, namespace, familyKind) {
    return Object.freeze({
      ...(namespace === undefined ? {} : { namespace }),
      name: identity.name,
      ...(familyKind === catalogueSourceFamilyKinds.icon
        && identity.variant !== undefined
        ? { variant: identity.variant }
        : {}),
    });
  }

  /**
   * @description Validates one resolved complete icon identity.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {unknown} value - Resolved identity candidate.
   * @param {string} propertyName - Logical property name used for failure context.
   * @returns {{ namespace?: string, name: string, variant?: string }} Frozen complete icon identity.
   */
  #resolvedIconIdentity(sourcePath, value, propertyName) {
    const identity = typeof value === "object" && value !== null
      ? /** @type {Record<string, unknown>} */ (value)
      : undefined;

    if (
      identity === undefined
      || typeof identity.name !== "string"
      || (identity.namespace !== undefined && typeof identity.namespace !== "string")
      || (identity.variant !== undefined && typeof identity.variant !== "string")
    ) {
      throw new CatalogueSourceError(
        `${sourcePath} must resolve ${propertyName} to one icon identity.`,
      );
    }

    return Object.freeze({
      ...(identity.namespace === undefined ? {} : { namespace: identity.namespace }),
      name: identity.name,
      ...(identity.variant === undefined ? {} : { variant: identity.variant }),
    });
  }

  /**
   * @description Resolves one required string-valued property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the property.
   * @param {string} name - Required property name.
   * @returns {Promise<string>} Resolved string value.
   */
  async #requiredStringProperty(sourcePath, sourceFile, object, name) {
    const value = await this.#resolvedProperty(
      sourcePath,
      sourceFile,
      object,
      name,
      true,
    );

    if (typeof value !== "string") {
      this.#invalidResolvedProperty(sourcePath, name, "a string");
    }

    return value;
  }

  /**
   * @description Resolves one optional string-valued property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the property.
   * @param {string} name - Optional property name.
   * @returns {Promise<string | undefined>} Resolved optional string value.
   */
  async #optionalStringProperty(sourcePath, sourceFile, object, name) {
    const value = await this.#resolvedProperty(
      sourcePath,
      sourceFile,
      object,
      name,
      false,
    );

    if (value !== undefined && typeof value !== "string") {
      this.#invalidResolvedProperty(sourcePath, name, "a string");
    }

    return value;
  }

  /**
   * @description Resolves one required boolean-valued property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the property.
   * @param {string} name - Required property name.
   * @returns {Promise<boolean>} Resolved boolean value.
   */
  async #requiredBooleanProperty(sourcePath, sourceFile, object, name) {
    const value = await this.#resolvedProperty(
      sourcePath,
      sourceFile,
      object,
      name,
      true,
    );

    if (typeof value !== "boolean") {
      this.#invalidResolvedProperty(sourcePath, name, "a boolean");
    }

    return value;
  }

  /**
   * @description Resolves one optional string-array property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the property.
   * @param {string} name - Optional property name.
   * @returns {Promise<readonly string[] | undefined>} Resolved immutable discovery terms.
   */
  async #optionalTagsProperty(sourcePath, sourceFile, object, name) {
    const value = await this.#resolvedProperty(
      sourcePath,
      sourceFile,
      object,
      name,
      false,
    );

    if (
      value !== undefined
      && (!Array.isArray(value) || !value.every((entry) => typeof entry === "string"))
    ) {
      this.#invalidResolvedProperty(sourcePath, name, "a string array");
    }

    return value;
  }

  /**
   * @description Resolves one unique direct property through the static value authority.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").SourceFile} sourceFile - Parsed source document.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the property.
   * @param {string} name - Property name to resolve.
   * @param {boolean} required - Whether absence is invalid.
   * @returns {Promise<unknown | undefined>} Resolved property value when present.
   */
  async #resolvedProperty(sourcePath, sourceFile, object, name, required) {
    const value = this.#propertyValue(sourcePath, object, name, required);

    return value === undefined
      ? undefined
      : this.#values.resolve(sourcePath, sourceFile, value);
  }

  /**
   * @description Resolves one required object-valued direct property.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the required property.
   * @param {string} name - Required property name.
   * @returns {import("typescript").ObjectLiteralExpression} Direct object literal value.
   */
  #requiredObjectProperty(sourcePath, object, name) {
    const value = this.#propertyValue(sourcePath, object, name, true);

    if (value === undefined || !ts.isObjectLiteralExpression(value)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare ${name} as an object literal.`,
      );
    }

    return value;
  }

  /**
   * @description Resolves one unique direct property assignment.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {import("typescript").ObjectLiteralExpression} object - Direct object containing the candidate property.
   * @param {string} name - Property name to resolve.
   * @param {boolean} required - Whether absence is invalid.
   * @returns {import("typescript").Expression | undefined} Direct property value when present.
   */
  #propertyValue(sourcePath, object, name, required) {
    /** @type {import("typescript").PropertyAssignment[]} */
    const properties = [];

    for (const property of object.properties) {
      if (
        ts.isPropertyAssignment(property)
        && ((ts.isIdentifier(property.name) && property.name.text === name)
          || (ts.isStringLiteralLike(property.name) && property.name.text === name))
      ) {
        properties.push(property);
      }
    }

    if (properties.length > 1 || (required && properties.length === 0)) {
      throw new CatalogueSourceError(
        `${sourcePath} must declare exactly one ${name} property.`,
      );
    }

    return properties[0]?.initializer;
  }

  /**
   * @description Rejects one resolved property with an incompatible data shape.
   * @param {string} sourcePath - Absolute source path used for failure context.
   * @param {string} name - Invalid property name.
   * @param {string} expectation - Human-readable accepted data shape.
   * @returns {never} Always throws one stable catalogue source error.
   */
  #invalidResolvedProperty(sourcePath, name, expectation) {
    throw new CatalogueSourceError(
      `${sourcePath} must resolve ${name} to ${expectation}.`,
    );
  }
}
