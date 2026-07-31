import type {
  CollectionDefinition,
  IconDefinition,
} from "@aster/core";
import { Svg } from "@aster/svg";
import { pilotReviewConfig } from "../constants/pilot-review-config.constant.js";

/**
 * @description Renders deterministic standalone SVG evidence for pilot visual review.
 */
export class PilotContactSheetRenderer {
  /**
   * @description Renders one canonical icon as a disposable standalone review SVG.
   * @param definition - Canonical portable icon definition.
   * @returns Complete generated SVG source.
   */
  renderIcon(definition: IconDefinition): string {
    return this.#generatedHeader() + Svg.render(definition) + "\n";
  }

  /**
   * @description Renders every collection member at one review size and colour theme.
   * @param collection - Canonical collection under review.
   * @param size - Logical icon viewport size.
   * @param theme - Accepted light or dark review theme.
   * @returns Complete generated contact-sheet SVG.
   */
  renderContactSheet(
    collection: CollectionDefinition,
    size: number,
    theme: keyof typeof pilotReviewConfig.themes,
  ): string {
    const palette = pilotReviewConfig.themes[theme];
    const items = collection.icons.map((definition) => ({
      definition,
      size,
      caption: definition.identity.name,
    }));

    return this.#renderGrid(
      items,
      `Aster pilot - ${size}px - ${theme}`,
      palette.background,
      palette.foreground,
      4,
    );
  }

  /**
   * @description Renders a large monochrome contour comparison for the complete outline family.
   * @param collection - Canonical collection under review.
   * @returns Complete generated silhouette-comparison SVG.
   */
  renderSilhouetteComparison(collection: CollectionDefinition): string {
    const items = collection.icons.map((definition) => ({
      definition,
      size: pilotReviewConfig.sizes.silhouette,
      caption: definition.identity.name,
    }));

    return this.#renderGrid(
      items,
      "Aster pilot - monochrome contour stress view",
      "#ffffff",
      "#000000",
      4,
    );
  }

  /**
   * @description Renders the configured construction-role references side by side.
   * @param collection - Canonical collection under review.
   * @returns Complete generated reference-comparison SVG.
   */
  renderReferenceComparison(collection: CollectionDefinition): string {
    const definitionByName = new Map(
      collection.icons.map((definition) => [
        definition.identity.name,
        definition,
      ]),
    );
    const items = Object.entries(pilotReviewConfig.comparisons).flatMap(
      ([role, names]) =>
        names.map((name) => {
          const definition = definitionByName.get(name);

          if (definition === undefined) {
            throw new TypeError(
              `Review role ${role} references unavailable icon ${name}.`,
            );
          }

          return {
            definition,
            size: pilotReviewConfig.sizes.default,
            caption: `${role}: ${name}`,
          };
        }),
    );

    return this.#renderGrid(
      items,
      "Aster pilot - construction-role references",
      pilotReviewConfig.themes.light.background,
      pilotReviewConfig.themes.light.foreground,
      3,
    );
  }

  /**
   * @description Composes nested public SVG results into one labelled review grid.
   * @param items - Ordered icon definitions, sizes, and captions.
   * @param title - Human-readable sheet title.
   * @param background - Exact SVG background paint.
   * @param foreground - Exact SVG foreground and inherited `currentColor` paint.
   * @param columns - Positive grid column count.
   * @returns Complete generated contact-sheet SVG.
   */
  #renderGrid(
    items: readonly Readonly<{
      definition: IconDefinition;
      size: number;
      caption: string;
    }>[],
    title: string,
    background: string,
    foreground: string,
    columns: number,
  ): string {
    const cellWidth = 168;
    const cellHeight = 94;
    const headerHeight = 52;
    const rows = Math.ceil(items.length / columns);
    const width = columns * cellWidth;
    const height = headerHeight + rows * cellHeight;
    const content = items
      .map((item, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const x = column * cellWidth;
        const y = headerHeight + row * cellHeight;
        const iconX = x + (cellWidth - item.size) / 2;
        const iconY = y + 14;
        const captionY = y + 72;

        return [
          `<rect x="${x + 4}" y="${y + 4}" width="${cellWidth - 8}" height="${cellHeight - 8}" rx="8" fill="none" stroke="${foreground}" stroke-opacity="0.16"/>`,
          `<g transform="translate(${this.#number(iconX)} ${this.#number(iconY)})">${Svg.render(item.definition, { size: item.size })}</g>`,
          `<text x="${this.#number(x + cellWidth / 2)}" y="${captionY}" fill="${foreground}" font-family="sans-serif" font-size="11" text-anchor="middle">${this.#escape(item.caption)}</text>`,
        ].join("");
      })
      .join("");

    return [
      this.#generatedHeader(),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" color="${foreground}">`,
      `<rect width="${width}" height="${height}" fill="${background}"/>`,
      `<text x="20" y="31" fill="${foreground}" font-family="sans-serif" font-size="18" font-weight="600">${this.#escape(title)}</text>`,
      content,
      "</svg>\n",
    ].join("");
  }

  /**
   * @description Returns the generated-source ownership header shared by review SVGs.
   * @returns Deterministic XML comment naming the source and command.
   */
  #generatedHeader(): string {
    return `<!-- Generated by ${pilotReviewConfig.generatedBy} from ${pilotReviewConfig.source}. Do not edit. -->\n`;
  }

  /**
   * @description Escapes trusted review labels for SVG text nodes.
   * @param value - Canonical collection or icon label.
   * @returns XML-safe text.
   */
  #escape(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  /**
   * @description Canonicalises one finite grid coordinate.
   * @param value - Finite computed coordinate.
   * @returns Locale-independent decimal representation.
   */
  #number(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
  }
}
