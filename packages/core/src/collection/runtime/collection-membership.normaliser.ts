import type { IconDefinition } from "../../definition/contracts/index.js";
import { IconIdentityNormaliser } from "../../definition/runtime/icon-identity.normaliser.js";
import { IconDefinitionFactory } from "../../definition/runtime/icon-definition.factory.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { collectionIconAliasPatternSource } from "../constants/collection-icon-alias-pattern-source.constant.js";
import type { CollectionIconMap } from "../contracts/index.js";
import type { TCollectionMembershipResult } from "../types/internal/index.js";
import { CanonicalIconMatcher } from "./canonical-icon.matcher.js";

/**
 * @description Validates one authored icon map and derives its canonical ordered membership.
 */
export class CollectionMembershipNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Compiled collection-local alias grammar.
   */
  readonly #aliasPattern = new RegExp(collectionIconAliasPatternSource, "u");

  /**
   * @description Portable icon validation and isolation authority.
   */
  readonly #iconFactory = new IconDefinitionFactory();

  /**
   * @description Canonical frozen icon retention authority.
   */
  readonly #canonicalIconMatcher = new CanonicalIconMatcher();

  /** @description Icon identity authority shared with public variant-property name derivation. */
  readonly #iconIdentityNormaliser = new IconIdentityNormaliser();

  /**
   * @description Produces frozen keyed and ordered views from one authored icon map.
   * @param value - Unknown authored icon alias map.
   * @param path - Logical map path used by deterministic failures.
   * @returns Canonical membership retaining concrete compile-time aliases.
   * @typeParam TIconMap - Concrete collection-local icon alias map.
   */
  normalise<TIconMap extends CollectionIconMap>(
    value: unknown,
    path = "collection.icons",
  ): TCollectionMembershipResult<TIconMap> {
    const authored = this.#validator.record(value, path);
    const icons: Record<string, Readonly<Record<string, IconDefinition>>> = Object.create(null);
    const members: IconDefinition[] = [];
    const identities = new Set<string>();

    for (const field of Reflect.ownKeys(authored)) {
      if (typeof field !== "string") {
        throw new IconDefinitionError(path, "expected string aliases");
      }

      const fieldPath = `${path}.${field}`;
      const alias = this.#validateAlias(field, fieldPath);
      const candidate = this.#validator.dataProperty(authored, field, fieldPath);
      const group = this.#normaliseGroup(candidate, fieldPath, identities, members);
      Object.defineProperty(icons, alias, {
        value: group,
        enumerable: true,
      });
    }

    return Object.freeze({
      icons: Object.freeze(icons) as TCollectionMembershipResult<TIconMap>["icons"],
      members: Object.freeze(members),
    });
  }

  /**
   * @description Validates one non-empty treatment selection and appends canonical flat members.
   * @param value - Unknown authored treatment dictionary.
   * @param path - Collection-local group path.
   * @param identities - Concrete identities already selected anywhere in the collection.
   * @param members - Ordered canonical leaves derived from the accepted maps.
   * @returns Frozen prototype-free group containing the selected canonical leaf references.
   */
  #normaliseGroup(
    value: unknown,
    path: string,
    identities: Set<string>,
    members: IconDefinition[],
  ): Readonly<Record<string, IconDefinition>> {
    const authored = this.#validator.record(value, path);
    const keys = Reflect.ownKeys(authored);
    if (keys.length === 0) {
      throw new IconDefinitionError(path, "expected a non-empty variant group");
    }
    const group: Record<string, IconDefinition> = Object.create(null);
    let firstGlyph: string | undefined;
    for (const property of keys) {
      if (typeof property !== "string") {
        throw new IconDefinitionError(path, "expected string variant properties");
      }
      const propertyPath = `${path}.${property}`;
      const icon = this.#normaliseIcon(this.#validator.dataProperty(authored, property, propertyPath));
      if (this.#iconIdentityNormaliser.variantPropertyName(icon.identity.variant, propertyPath) !== property) {
        throw new IconDefinitionError(propertyPath, "expected the canonical variant property");
      }
      const glyph = this.#glyphKey(icon);
      if (firstGlyph !== undefined && firstGlyph !== glyph) {
        throw new IconDefinitionError(propertyPath, "expected definitions of the same glyph");
      }
      const identity = this.#identityKey(icon);
      if (identities.has(identity)) {
        throw new IconDefinitionError(propertyPath, "duplicates an icon identity");
      }
      identities.add(identity);
      Object.defineProperty(group, property, { value: icon, enumerable: true });
      members.push(icon);
      firstGlyph ??= glyph;
    }
    return Object.freeze(group);
  }

  /**
   * @description Validates one collection-local public alias.
   * @param value - Authored alias text.
   * @param path - Logical alias path used by deterministic failures.
   * @returns Accepted alias unchanged.
   */
  #validateAlias(value: string, path: string): string {
    if (!this.#aliasPattern.test(value)) {
      throw new IconDefinitionError(path, "expected a lower camel-case alias");
    }

    return value;
  }

  /**
   * @description Confirms that a submitted complete-definition sequence matches derived membership.
   * @param value - Unknown submitted ordered member sequence.
   * @param derived - Canonical members derived from the icon map.
   * @param path - Logical sequence path used by deterministic failures.
   * @returns Nothing.
   */
  validateMembers(
    value: unknown,
    derived: readonly IconDefinition[],
    path = "collection.members",
  ): void {
    const submitted = this.#validator.array(value, path);

    if (submitted.length !== derived.length) {
      throw new IconDefinitionError(path, "does not match derived membership");
    }

    for (let index = 0; index < submitted.length; index += 1) {
      const candidate = this.#normaliseIcon(submitted[index]);
      const member = derived[index];

      if (
        member === undefined
        || (candidate !== member && !this.#canonicalIconMatcher.matches(candidate, member))
      ) {
        throw new IconDefinitionError(
          `${path}[${index}]`,
          "does not match derived membership",
        );
      }
    }
  }

  /**
   * @description Accepts an icon and retains recognised or validated equivalent canonical data.
   * @param value - Candidate portable icon.
   * @returns Canonical retained or isolated icon definition.
   */
  #normaliseIcon(value: unknown): IconDefinition {
    const accepted = this.#iconFactory.create(value);

    if (value === accepted) {
      return accepted;
    }

    return this.#canonicalIconMatcher.matches(value, accepted) ? value : accepted;
  }

  /**
   * @description Creates one stable duplicate key from canonical icon identity.
   * @param definition - Canonical icon definition.
   * @returns Namespace, name, and variant identity key.
   */
  #identityKey(definition: IconDefinition): string {
    return `${this.#glyphKey(definition)}/${definition.identity.variant}`;
  }

  /**
   * @description Identifies a glyph without reading absent namespace properties through a prototype.
   * @param definition - Accepted concrete definition.
   * @returns Unambiguous optional namespace and glyph-name key.
   */
  #glyphKey(definition: IconDefinition): string {
    const identity = definition.identity;
    const namespace = Object.hasOwn(identity, "namespace") ? identity.namespace : "";
    return `${namespace}/${identity.name}`;
  }
}
