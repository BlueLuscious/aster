import type { IconDefinition } from "../../definition/contracts/index.js";
import { IconDefinitionFactory } from "../../definition/runtime/icon-definition.factory.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import type { CollectionDefinition } from "../contracts/index.js";
import { CanonicalIconMatcher } from "./canonical-icon.matcher.js";
import { CollectionIdentityNormaliser } from "./collection-identity.normaliser.js";
import { CollectionMetadataNormaliser } from "./collection-metadata.normaliser.js";

/**
 * @description Internal construction authority for immutable collection definitions.
 */
export class CollectionDefinitionFactory {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Collection identity normalisation authority.
   */
  readonly #identityNormaliser = new CollectionIdentityNormaliser();

  /**
   * @description Collection metadata normalisation authority.
   */
  readonly #metadataNormaliser = new CollectionMetadataNormaliser();

  /**
   * @description Portable icon validation and isolation authority.
   */
  readonly #iconFactory = new IconDefinitionFactory();

  /**
   * @description Canonical frozen icon retention authority.
   */
  readonly #canonicalIconMatcher = new CanonicalIconMatcher();

  /**
   * @description Validates authored data and returns a deeply frozen collection.
   * @param value - Unknown authored collection value.
   * @returns Deeply frozen canonical collection definition.
   */
  create(value: unknown): CollectionDefinition {
    const path = "collection";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, ["identity", "icons", "metadata"], path);
    const identities = new Set<string>();
    const icons = this.#validator
      .array(record.icons, `${path}.icons`)
      .map((value, index) => {
        const icon = this.#normaliseIcon(value);
        const key = this.#identityKey(icon);

        if (identities.has(key)) {
          throw new IconDefinitionError(
            `${path}.icons[${index}]`,
            "duplicates an icon identity",
          );
        }

        identities.add(key);
        return icon;
      });

    return Object.freeze({
      identity: this.#identityNormaliser.normalise(record.identity),
      icons: Object.freeze(icons),
      metadata: this.#metadataNormaliser.normalise(record.metadata),
    });
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
   * @description Creates a stable collection-local duplicate key.
   * @param definition - Canonical icon definition.
   * @returns Namespace, name, and variant identity key.
   */
  #identityKey(definition: IconDefinition): string {
    const { namespace, name, variant } = definition.identity;
    return `${namespace ?? ""}/${name}/${variant ?? ""}`;
  }
}
