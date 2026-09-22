import { catalogueResultKinds } from "../../../catalogue/constants/catalogue-result-kinds.constant.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
} from "../../../catalogue/contracts/index.js";
import { asterCommandPayloadKinds } from "../../../command/constants/aster-command-payload-kinds.constant.js";
import type { TCataloguePayload } from "../types/internal/catalogue-payload.type.js";
import { HumanTextFormatter } from "./human-text.formatter.js";
import { ShellIdentityFormatter } from "./shell-identity.formatter.js";

/**
 * @description Renders catalogue discovery payloads as deterministic human-readable text.
 */
export class CatalogueHumanOutputPresenter {
  /**
   * @description Portable identity formatter for catalogue result families.
   */
  readonly #identities = new ShellIdentityFormatter();

  /**
   * @description Shared sequence and count formatter.
   */
  readonly #text = new HumanTextFormatter();

  /**
   * @description Renders one catalogue-owned success payload.
   * @param payload - Structured catalogue discovery payload.
   * @returns Plain deterministic output without a final newline.
   */
  present(payload: TCataloguePayload): string {
    switch (payload.kind) {
      case asterCommandPayloadKinds.catalogueList:
        return this.#text.sequence(
          "Catalogues",
          payload.catalogues.map((catalogue) =>
            `${catalogue.identity} (${this.#text.count(catalogue.iconCount, "icon")}, ${this.#text.count(catalogue.collectionCount, "collection")})`,
          ),
        );
      case asterCommandPayloadKinds.collectionList:
        return this.#text.sequence(
          "Collections",
          payload.collections.map((collection) =>
            `${this.#identities.format(collection.identity)} [${collection.catalogue}] - ${collection.metadata.displayName} (${this.#text.count(collection.icons.length, "icon")})`,
          ),
        );
      case asterCommandPayloadKinds.iconList:
        return this.#text.sequence(
          "Icons",
          payload.icons.map((icon) => this.#iconSummary(icon)),
        );
      case asterCommandPayloadKinds.search:
        return this.#text.sequence(
          "Results",
          payload.results.map((entry) =>
            entry.kind === catalogueResultKinds.icon
              ? `icon: ${this.#iconSummary(entry)}`
              : `collection: ${this.#identities.format(entry.identity)} [${entry.catalogue}] - ${entry.metadata.displayName}`,
          ),
        );
      case asterCommandPayloadKinds.iconShow:
        return this.#iconDetails(payload.icon);
      case asterCommandPayloadKinds.collectionShow:
        return this.#collectionDetails(payload.collection);
    }
  }

  /**
   * @description Formats one icon result for list and search output.
   * @param icon - Structured catalogue icon result.
   * @returns One deterministic icon summary line.
   */
  #iconSummary(icon: CatalogueIconResult): string {
    const memberships = icon.memberships.length === 0
      ? "none"
      : icon.memberships
          .map((identity) => this.#identities.format(identity))
          .join(", ");
    return `${this.#identities.format(icon.identity)} [${icon.catalogue}] - ${icon.metadata.displayName} (collections: ${memberships})`;
  }

  /**
   * @description Formats complete human evidence for one exact icon result.
   * @param icon - Exact structured catalogue icon result.
   * @returns Deterministic multi-line icon details.
   */
  #iconDetails(icon: CatalogueIconResult): string {
    const tags = icon.metadata.tags?.join(", ") ?? "none";
    const memberships = icon.memberships.length === 0
      ? "none"
      : icon.memberships
          .map((identity) => this.#identities.format(identity))
          .join(", ");
    return [
      `Icon: ${this.#identities.format(icon.identity)}`,
      `Catalogue: ${icon.catalogue}`,
      `Display name: ${icon.metadata.displayName}`,
      `Tags: ${tags}`,
      `Collections: ${memberships}`,
      `Deprecated: ${icon.metadata.deprecated ? "yes" : "no"}`,
    ].join("\n");
  }

  /**
   * @description Formats complete human evidence for one exact collection result.
   * @param collection - Exact structured catalogue collection result.
   * @returns Deterministic multi-line collection details.
   */
  #collectionDetails(collection: CatalogueCollectionResult): string {
    const tags = collection.metadata.tags?.join(", ") ?? "none";
    const icons = collection.icons.length === 0
      ? "none"
      : collection.icons
          .map((identity) => this.#identities.format(identity))
          .join(", ");
    return [
      `Collection: ${this.#identities.format(collection.identity)}`,
      `Catalogue: ${collection.catalogue}`,
      `Display name: ${collection.metadata.displayName}`,
      `Tags: ${tags}`,
      `Icons: ${icons}`,
    ].join("\n");
  }
}
