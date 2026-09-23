import type { IconDefinition } from "../../definition/contracts/index.js";
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
    const icons: Record<string, IconDefinition> = {};
    const members: IconDefinition[] = [];
    const identities = new Set<string>();

    for (const field of Reflect.ownKeys(authored)) {
      if (typeof field !== "string") {
        throw new IconDefinitionError(path, "expected string aliases");
      }

      const fieldPath = `${path}.${field}`;
      const alias = this.#normaliseAlias(field, fieldPath);
      const candidate = this.#validator.dataProperty(authored, field, fieldPath);
      const icon = this.#normaliseIcon(candidate);
      const identity = this.#identityKey(icon);

      if (identities.has(identity)) {
        throw new IconDefinitionError(fieldPath, "duplicates an icon identity");
      }

      identities.add(identity);
      icons[alias] = icon;
      members.push(icon);
    }

    return Object.freeze({
      icons: Object.freeze(icons) as Readonly<TIconMap>,
      members: Object.freeze(members),
    });
  }

  /**
   * @description Validates one collection-local public alias.
   * @param value - Authored alias text.
   * @param path - Logical alias path used by deterministic failures.
   * @returns Accepted alias unchanged.
   */
  #normaliseAlias(value: string, path: string): string {
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
        || !this.#canonicalIconMatcher.matches(candidate, member)
      ) {
        throw new IconDefinitionError(
          `${path}[${index}]`,
          "does not match derived membership",
        );
      }
    }
  }

  /**
   * @description Revalidates one icon and retains an already deeply frozen canonical value.
   * @param value - Candidate portable icon.
   * @returns Canonical retained or isolated icon definition.
   */
  #normaliseIcon(value: unknown): IconDefinition {
    const isolated = this.#iconFactory.create(value);
    return this.#canonicalIconMatcher.matches(value, isolated) ? value : isolated;
  }

  /**
   * @description Creates one stable duplicate key from canonical icon identity.
   * @param definition - Canonical icon definition.
   * @returns Namespace, name, and variant identity key.
   */
  #identityKey(definition: IconDefinition): string {
    const { namespace, name, variant } = definition.identity;
    return `${namespace ?? ""}/${name}/${variant ?? ""}`;
  }
}
