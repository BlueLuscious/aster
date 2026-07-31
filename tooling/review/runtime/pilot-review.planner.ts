import type { CollectionDefinition } from "@aster/core";
import { pilotReviewConfig } from "../constants/pilot-review-config.constant.js";
import type { IPilotReviewFile } from "../contracts/internal/pilot-review-file.contract.js";
import { PilotContactSheetRenderer } from "./pilot-contact-sheet.renderer.js";
import { PilotGeometryAnalyser } from "./pilot-geometry.analyser.js";

/**
 * @description Plans the complete deterministic disposable evidence set for pilot review.
 */
export class PilotReviewPlanner {
  /**
   * @description Automated portable-geometry evidence authority.
   */
  readonly #analyser = new PilotGeometryAnalyser();

  /**
   * @description Standalone SVG and contact-sheet renderer.
   */
  readonly #renderer = new PilotContactSheetRenderer();

  /**
   * @description Plans review files without reading or mutating filesystem state.
   * @param collection - Canonical immutable collection under review.
   * @returns Deeply frozen ordered review files.
   */
  plan(collection: CollectionDefinition): readonly IPilotReviewFile[] {
    const report = this.#analyser.analyse(collection);
    const files: IPilotReviewFile[] = [
      {
        path: "report.json",
        content: `${JSON.stringify(report, null, 2)}\n`,
      },
      {
        path: "contact-sheets/default-light.svg",
        content: this.#renderer.renderContactSheet(
          collection,
          pilotReviewConfig.sizes.default,
          "light",
        ),
      },
      {
        path: "contact-sheets/default-dark.svg",
        content: this.#renderer.renderContactSheet(
          collection,
          pilotReviewConfig.sizes.default,
          "dark",
        ),
      },
      {
        path: "contact-sheets/minimum-light.svg",
        content: this.#renderer.renderContactSheet(
          collection,
          pilotReviewConfig.sizes.minimum,
          "light",
        ),
      },
      {
        path: "contact-sheets/minimum-dark.svg",
        content: this.#renderer.renderContactSheet(
          collection,
          pilotReviewConfig.sizes.minimum,
          "dark",
        ),
      },
      {
        path: "contact-sheets/silhouette-comparison.svg",
        content: this.#renderer.renderSilhouetteComparison(collection),
      },
      {
        path: "contact-sheets/reference-comparison.svg",
        content: this.#renderer.renderReferenceComparison(collection),
      },
      ...collection.icons.map((definition) => ({
        path: `icons/${definition.identity.name}.svg`,
        content: this.#renderer.renderIcon(definition),
      })),
    ];

    return Object.freeze(
      files.map((file) =>
        Object.freeze({
          path: file.path,
          content: file.content,
        }),
      ),
    );
  }
}
