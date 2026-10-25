import { catalogueResultKinds } from "../../../catalogue/constants/catalogue-result-kinds.constant.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
  CatalogueGlyphResult,
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
          payload.catalogues.map(
            (catalogue) =>
              `${this.#text.value(catalogue.identity)} (${this.#text.count(catalogue.iconCount, "icon")}, ${this.#text.count(catalogue.collectionCount, "collection")})`,
          ),
        );
      case asterCommandPayloadKinds.collectionList:
        return this.#text.sequence(
          "Collections",
          payload.collections.map(
            (collection) =>
              `${this.#text.value(this.#identities.format(collection.identity))} [${this.#text.value(collection.catalogue)}] - ${this.#text.value(collection.metadata.displayName)} (${this.#text.count(collection.memberIdentities.length, "icon")})`,
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
              : `collection: ${this.#text.value(this.#identities.format(entry.identity))} [${this.#text.value(entry.catalogue)}] - ${this.#text.value(entry.metadata.displayName)}`,
          ),
        );
      case asterCommandPayloadKinds.glyphList:
        return this.#text.sequence(
          "Glyphs",
          payload.glyphs.map((glyph) => this.#glyphSummary(glyph)),
        );
      case asterCommandPayloadKinds.glyphShow:
        return [
          `Glyph: ${this.#text.value(this.#identities.format(payload.glyph.identity))}`,
          `Catalogue: ${this.#text.value(payload.glyph.catalogue)}`,
          this.#text.sequence(
            "Variants",
            payload.glyph.variants.map((variant) => this.#iconSummary(variant)),
          ),
        ].join("\n");
      case asterCommandPayloadKinds.iconShow:
        return this.#iconDetails(payload.icon);
      case asterCommandPayloadKinds.collectionShow:
        return this.#collectionDetails(payload.collection);
    }
  }

  /**
   * @description Formats one icon result for list and search output.
   * @param icon - Structured catalogue icon result.
   * @returns Identity summary with its explicit nested collection-membership sequence.
   */
  #iconSummary(icon: CatalogueIconResult): string {
    return [
      `${this.#text.value(this.#identities.format(icon.identity))} [${this.#text.value(icon.catalogue)}] - ${this.#text.value(icon.metadata.displayName)}`,
      this.#text.indent(
        this.#text.sequence(
          "Collections",
          icon.memberships.map((identity) =>
            this.#text.value(this.#identities.format(identity)),
          ),
        ),
      ),
    ].join("\n");
  }

  /**
   * @description Formats complete human evidence for one exact icon result.
   * @param icon - Exact structured catalogue icon result.
   * @returns Deterministic multi-line icon details.
   */
  #iconDetails(icon: CatalogueIconResult): string {
    const tags =
      (Object.hasOwn(icon.metadata, "tags") ? icon.metadata.tags : undefined) ??
      [];
    return [
      `Icon: ${this.#text.value(this.#identities.format(icon.identity))}`,
      `Catalogue: ${this.#text.value(icon.catalogue)}`,
      `Display name: ${this.#text.value(icon.metadata.displayName)}`,
      this.#text.sequence(
        "Tags",
        tags.map((tag) => this.#text.value(tag)),
      ),
      this.#text.sequence(
        "Collections",
        icon.memberships.map((identity) =>
          this.#text.value(this.#identities.format(identity)),
        ),
      ),
      `Deprecated: ${icon.metadata.deprecated ? "yes" : "no"}`,
    ].join("\n");
  }

  /**
   * @description Summarises one glyph without inventing family-level icon metadata.
   * @param glyph - Exact provider-scoped glyph result.
   * @returns Family identity and count followed by its nested available-treatment sequence.
   */
  #glyphSummary(glyph: CatalogueGlyphResult): string {
    return [
      `${this.#text.value(this.#identities.format(glyph.identity))} [${this.#text.value(glyph.catalogue)}] (${this.#text.count(glyph.variants.length, "variant")})`,
      this.#text.indent(
        this.#text.sequence(
          "Variants",
          glyph.variants.map((variant) =>
            this.#text.value(variant.identity.variant),
          ),
        ),
      ),
    ].join("\n");
  }

  /**
   * @description Formats complete human evidence for one exact collection result.
   * @param collection - Exact structured catalogue collection result.
   * @returns Deterministic multi-line collection details.
   */
  #collectionDetails(collection: CatalogueCollectionResult): string {
    const tags =
      (Object.hasOwn(collection.metadata, "tags")
        ? collection.metadata.tags
        : undefined) ?? [];
    return [
      `Collection: ${this.#text.value(this.#identities.format(collection.identity))}`,
      `Catalogue: ${this.#text.value(collection.catalogue)}`,
      `Display name: ${this.#text.value(collection.metadata.displayName)}`,
      this.#text.sequence(
        "Tags",
        tags.map((tag) => this.#text.value(tag)),
      ),
      this.#text.sequence(
        "Icons",
        collection.memberIdentities.map((identity) =>
          this.#text.value(this.#identities.format(identity)),
        ),
      ),
    ].join("\n");
  }
}
