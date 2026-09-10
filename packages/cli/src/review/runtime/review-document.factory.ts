import { Svg, SvgRenderError } from "@aster/svg";
import type { TCatalogueSelection } from "../../catalogue/types/internal/catalogue-selection.type.js";
import { CatalogueIdentityFormatter } from "../../catalogue/runtime/catalogue-identity.formatter.js";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import { AsciiStringComparator } from "../../shared/runtime/ascii-string.comparator.js";
import { reviewSubjects } from "../constants/review-subjects.constant.js";
import type {
  AsterReviewDocumentType,
} from "../types/index.js";
import type { AsterReviewIconEvidence } from "../contracts/index.js";

/**
 * @description Constructs deterministic technical review models through the public SVG renderer.
 */
export class ReviewDocumentFactory {
  /**
   * @description Immutable diagnostic constructor for contained render failures.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Canonical portable icon identity formatter.
   */
  readonly #identities = new CatalogueIdentityFormatter();

  /**
   * @description Locale-independent primitive-family ordering authority.
   */
  readonly #strings = new AsciiStringComparator();

  /**
   * @description Creates one complete icon or collection review model atomically.
   * @param selection - Exact accepted catalogue selection.
   * @returns Complete immutable model or one deterministic render failure.
   */
  create(
    selection: TCatalogueSelection,
  ): TAcceptanceResult<AsterReviewDocumentType> {
    const icons: AsterReviewIconEvidence[] = [];

    for (const selected of selection.icons) {
      try {
        icons.push(Object.freeze({
          identity: selected.definition.identity,
          metadata: selected.definition.metadata,
          viewBox: selected.definition.viewBox,
          nodeCount: selected.definition.nodes.length,
          primitiveKinds: Object.freeze([
            ...new Set(selected.definition.nodes.map((node) => node.kind)),
          ].sort((left, right) => this.#strings.compare(left, right))),
          memberships: selected.memberships,
          markup: Svg.render(selected.definition),
        }));
      } catch (error) {
        if (!(error instanceof SvgRenderError)) {
          throw error;
        }

        const identity = this.#identities.icon(selected.definition.identity);
        return Object.freeze({
          accepted: false,
          diagnostic: this.#diagnostics.create(
            commandDiagnosticSchema.categories.renderFailure,
            commandDiagnosticSchema.codes.renderFailure,
            `icon ${identity} could not be rendered for review`,
            [identity],
          ),
        });
      }
    }

    if (selection.subject === reviewSubjects.icon) {
      const icon = icons[0];

      if (icon === undefined) {
        throw new TypeError("Missing selected icon review evidence");
      }

      return Object.freeze({
        accepted: true,
        value: Object.freeze({ kind: reviewSubjects.icon, icon }),
      });
    }

    if (selection.collection === undefined) {
      throw new TypeError("Missing selected collection review evidence");
    }

    return Object.freeze({
      accepted: true,
      value: Object.freeze({
        kind: reviewSubjects.collection,
        identity: selection.collection.identity,
        metadata: selection.collection.metadata,
        icons: Object.freeze(icons),
      }),
    });
  }

}
