import { catalogueResultKinds } from "../../catalogue/constants/catalogue-result-kinds.constant.js";
import type {
  CatalogueCollectionResult,
  CatalogueIconResult,
} from "../../catalogue/contracts/index.js";
import { asterCommandPayloadKinds } from "../../command/constants/aster-command-payload-kinds.constant.js";
import type { AsterCommandDescriptor } from "../../command/contracts/index.js";
import type { AsterCommandResultType } from "../../command/types/index.js";
import { ShellIdentityFormatter } from "./shell-identity.formatter.js";

/**
 * @description Renders structured command results as deterministic plain human-readable text.
 */
export class HumanOutputPresenter {
  /**
   * @description Portable identity formatter shared by every human result family.
   */
  readonly #identities = new ShellIdentityFormatter();

  /**
   * @description Renders one successful command result without a final newline.
   * @param result - Structured immutable successful command result.
   * @returns Plain deterministic success text.
   */
  success(result: Extract<AsterCommandResultType, { ok: true }>): string {
    const payload = result.payload;

    switch (payload.kind) {
      case asterCommandPayloadKinds.export:
        return payload.plan.artefacts.length === 1
          ? payload.plan.artefacts[0]?.content ?? ""
          : this.#sequence(
              "SVG artefacts",
              payload.plan.artefacts.map((artefact) => artefact.path),
            );
      case asterCommandPayloadKinds.catalogueList:
        return this.#sequence(
          "Catalogues",
          payload.catalogues.map((catalogue) =>
            `${catalogue.identity} (${this.#count(catalogue.iconCount, "icon")}, ${this.#count(catalogue.collectionCount, "collection")})`,
          ),
        );
      case asterCommandPayloadKinds.collectionList:
        return this.#sequence(
          "Collections",
          payload.collections.map((collection) =>
            `${this.#identities.format(collection.identity)} [${collection.catalogue}] - ${collection.metadata.displayName} (${this.#count(collection.icons.length, "icon")})`,
          ),
        );
      case asterCommandPayloadKinds.iconList:
        return this.#sequence(
          "Icons",
          payload.icons.map((icon) => this.#iconSummary(icon)),
        );
      case asterCommandPayloadKinds.search:
        return this.#sequence(
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
      case asterCommandPayloadKinds.help:
        return this.#help(payload.descriptors);
      case asterCommandPayloadKinds.version:
        return `${payload.productName} ${payload.productVersion}`;
    }
  }

  /**
   * @description Renders one failed command result without a final newline.
   * @param result - Structured immutable failed command result.
   * @returns Plain deterministic diagnostic text.
   */
  failure(result: Extract<AsterCommandResultType, { ok: false }>): string {
    const related = result.diagnostic.related;
    return [
      `[${result.diagnostic.code}] ${result.diagnostic.message}`,
      ...(related === undefined || related.length === 0
        ? []
        : [`Related: ${related.join(", ")}`]),
    ].join("\n");
  }

  /**
   * @description Formats one icon result for list and search output.
   * @param icon - Structured catalogue icon result.
   * @returns One deterministic icon summary line.
   */
  #iconSummary(icon: CatalogueIconResult): string {
    const memberships = icon.memberships.length === 0
      ? "none"
      : icon.memberships.map((identity) =>
          this.#identities.format(identity),
        ).join(", ");
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
      : icon.memberships.map((identity) =>
          this.#identities.format(identity),
        ).join(", ");
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
      : collection.icons.map((identity) =>
          this.#identities.format(identity),
        ).join(", ");
    return [
      `Collection: ${this.#identities.format(collection.identity)}`,
      `Catalogue: ${collection.catalogue}`,
      `Display name: ${collection.metadata.displayName}`,
      `Tags: ${tags}`,
      `Icons: ${icons}`,
    ].join("\n");
  }

  /**
   * @description Formats complete or selected immutable command descriptors.
   * @param descriptors - Canonically ordered help metadata.
   * @returns Deterministic multi-line usage text.
   */
  #help(descriptors: readonly AsterCommandDescriptor[]): string {
    const lines = ["Aster commands:"];

    for (const descriptor of descriptors) {
      lines.push(`  ${descriptor.name}: ${descriptor.summary}`);

      for (const usage of descriptor.usage) {
        lines.push(`    aster ${usage}`);
      }
    }

    lines.push("Presentation:", "  --json  Emit one JSON result document.");
    return lines.join("\n");
  }

  /**
   * @description Adds a stable heading and explicit empty-state text to result lines.
   * @param heading - Human-readable result-family heading.
   * @param entries - Canonically ordered result lines.
   * @returns Deterministic multi-line sequence text.
   */
  #sequence(heading: string, entries: readonly string[]): string {
    return [
      `${heading}:`,
      ...(entries.length === 0
        ? ["  (none)"]
        : entries.map((entry) => `  ${entry}`)),
    ].join("\n");
  }

  /**
   * @description Formats a count with deterministic English singular or plural spelling.
   * @param value - Non-negative item count.
   * @param noun - Singular item-family noun.
   * @returns Count followed by its correctly inflected noun.
   */
  #count(value: number, noun: string): string {
    return `${value} ${noun}${value === 1 ? "" : "s"}`;
  }
}
