import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import type {
  CollectionDefinition,
  CollectionIconMap,
} from "../contracts/index.js";
import { CollectionIdentityNormaliser } from "./collection-identity.normaliser.js";
import { CollectionMembershipNormaliser } from "./collection-membership.normaliser.js";
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
   * @description Keyed and ordered collection membership authority.
   */
  readonly #membershipNormaliser = new CollectionMembershipNormaliser();

  /**
   * @description Validates authored data and returns a deeply frozen collection.
   * @param value - Unknown authored collection value.
   * @returns Deeply frozen canonical collection definition retaining concrete aliases.
   * @typeParam TIconMap - Concrete collection-local icon alias map.
   */
  create<TIconMap extends CollectionIconMap>(
    value: unknown,
  ): CollectionDefinition<TIconMap> {
    const path = "collection";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["identity", "icons", "members", "metadata"],
      path,
    );
    const identity = this.#validator.dataProperty(
      record,
      "identity",
      `${path}.identity`,
    );
    const icons = this.#validator.dataProperty(
      record,
      "icons",
      `${path}.icons`,
    );
    const metadata = this.#validator.dataProperty(
      record,
      "metadata",
      `${path}.metadata`,
    );
    const membership = this.#membershipNormaliser.normalise<TIconMap>(
      icons,
      `${path}.icons`,
    );

    if (Object.hasOwn(record, "members")) {
      this.#membershipNormaliser.validateMembers(
        this.#validator.dataProperty(record, "members", `${path}.members`),
        membership.members,
        `${path}.members`,
      );
    }

    return Object.freeze({
      identity: this.#identityNormaliser.normalise(identity),
      icons: membership.icons,
      members: membership.members,
      metadata: this.#metadataNormaliser.normalise(metadata),
    });
  }
}
