import type {
  IconNodeType,
  IconPresentation,
} from "@aster/core";
import type { IconImportDraft } from "../../../adoption/contracts/index.js";
import type { SvgIconImportSource } from "../../../source/contracts/svg-icon-import-source.contract.js";
import type { ISvgSyntaxDocument } from "../parser/contracts/internal/svg-syntax-document.contract.js";
import type { ISvgSyntaxElement } from "../parser/contracts/internal/svg-syntax-element.contract.js";
import type { TSvgValidationMetrics } from "../validation/types/internal/svg-validation-metrics.type.js";
import { iconImportFormats } from "../../../format/constants/icon-import-formats.constant.js";
import { SvgImportError } from "../shared/runtime/svg-import.error.js";
import { svgSourceElementSchema } from "../shared/constants/svg-source-element-schema.constant.js";
import { svgSourceElementRoles } from "../shared/constants/svg-source-element-roles.constant.js";
import { SvgPresentationNormaliser } from "../normalisation/runtime/svg-presentation.normaliser.js";
import { SvgPrimitiveNormaliser } from "../normalisation/runtime/svg-primitive.normaliser.js";

/**
 * @description Converts accepted SVG technical evidence into a neutral imported draft.
 */
export class SvgImportDraftFactory {
  /**
   * @description Inherited SVG presentation resolution authority.
   */
  readonly #presentationNormaliser = new SvgPresentationNormaliser();

  /**
   * @description Supported primitive conversion authority.
   */
  readonly #primitiveNormaliser = new SvgPrimitiveNormaliser();

  /**
   * @description Creates one deeply frozen metadata-free import draft.
   * @param source - Accepted isolated SVG source.
   * @param document - Parser-safe SVG syntax document.
   * @param metrics - Successful technical validation evidence.
   * @returns Complete format-neutral draft.
   */
  create(
    source: SvgIconImportSource,
    document: ISvgSyntaxDocument,
    metrics: TSvgValidationMetrics,
  ): IconImportDraft {
    const viewBox = metrics.viewBox?.value;

    if (viewBox === undefined) {
      throw new SvgImportError(
        "metrics.viewBox",
        "validated view box evidence is unavailable",
      );
    }

    return Object.freeze({
      identity: source.identity,
      viewBox,
      nodes: this.#nodes(document.root),
      metrics: Object.freeze({
        primitiveCount: metrics.primitiveCount,
        pathCommandCount: metrics.pathCommandCount,
      }),
      provenance: Object.freeze({
        format: iconImportFormats.svg,
        sourceId: source.sourceId,
      }),
    });
  }

  /**
   * @description Flattens structural syntax into portable nodes in paint order.
   * @param root - Safe validated SVG root.
   * @returns Ordered frozen portable geometry.
   */
  #nodes(root: ISvgSyntaxElement): readonly IconNodeType[] {
    const nodes: IconNodeType[] = [];

    /**
     * @description Visits one element with inherited portable presentation.
     * @param element - Current safe source element.
     * @param inherited - Presentation inherited from structural ancestors.
     * @returns Nothing.
     */
    const visit = (
      element: ISvgSyntaxElement,
      inherited: IconPresentation,
    ): void => {
      const presentation = this.#presentationNormaliser.normalise(
        element,
        inherited,
      );
      const schema = this.#schema(element.localName);

      if (schema === undefined) {
        throw new SvgImportError(
          "document",
          "validated source element is unsupported",
        );
      }

      if (schema.role === svgSourceElementRoles.primitive) {
        nodes.push(
          this.#primitiveNormaliser.normalise(element, presentation),
        );
      }

      for (const child of element.children) {
        visit(child, presentation);
      }
    };

    visit(root, Object.freeze({}));
    return Object.freeze(nodes);
  }

  /**
   * @description Resolves one accepted SVG source-element schema entry.
   * @param localName - Namespace-free SVG element name.
   * @returns Matching schema entry, or `undefined` when unsupported.
   */
  #schema(
    localName: string,
  ):
    | (typeof svgSourceElementSchema)[keyof typeof svgSourceElementSchema]
    | undefined {
    if (!Object.hasOwn(svgSourceElementSchema, localName)) {
      return undefined;
    }

    return svgSourceElementSchema[
      localName as keyof typeof svgSourceElementSchema
    ];
  }
}
